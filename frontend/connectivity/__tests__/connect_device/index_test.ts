let mockConfigValue: boolean | number = false;

import { HardwareState } from "../../../devices/interfaces";
import {
  incomingStatus,
  actOnChannelName,
  showLogOnScreen,
  TITLE,
  bothUp,
  initLog,
  onOffline,
  changeLastClientConnected,
  onSent,
  onOnline,
  onMalformed,
  speakLogAloud,
  onPublicBroadcast,
  onReconnect,
  logBeep,
} from "../../connect_device";
import { Actions, Content } from "../../../constants";
import { Log } from "farmbot/dist/resources/api_resources";
import {
  ALLOWED_CHANNEL_NAMES, ALLOWED_MESSAGE_TYPES, Farmbot, TaggedLog,
} from "farmbot";
import * as connectivity from "../../index";
import * as browserSpeech from "browser-speech";
import { MessageType } from "../../../sequences/interfaces";
import { FbjsEventName } from "farmbot/dist/constants";
import {
  info, error, success, warning, fun, busy, removeToast,
} from "../../../toast/toast";
import { onLogs } from "../../log_handlers";
import { fakeState } from "../../../__test_support__/fake_state";
import { globalQueue } from "../../batch_queue";
import * as beepSupport from "../../../util/beep";
import { store } from "../../../redux/store";
import * as mustBeOnline from "../../../devices/must_be_online";
import * as configStorageActions from "../../../config_storage/actions";

const ANY_NUMBER = expect.any(Number);
let dispatchNetworkUpSpy: jest.SpyInstance;
let dispatchNetworkDownSpy: jest.SpyInstance;
let forceOnlineSpy: jest.SpyInstance;
let getWebAppConfigValueSpy: jest.SpyInstance;
let talkSpy: jest.SpyInstance;
let beepSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  mockConfigValue = false;
  talkSpy = jest.spyOn(browserSpeech, "talk").mockImplementation(jest.fn());
  beepSpy = jest.spyOn(beepSupport, "beep").mockImplementation(jest.fn());
  dispatchNetworkUpSpy =
    jest.spyOn(connectivity, "dispatchNetworkUp").mockImplementation(jest.fn());
  dispatchNetworkDownSpy =
    jest.spyOn(connectivity, "dispatchNetworkDown").mockImplementation(jest.fn());
  forceOnlineSpy = jest.spyOn(mustBeOnline, "forceOnline").mockReturnValue(false);
  getWebAppConfigValueSpy =
    jest.spyOn(configStorageActions, "getWebAppConfigValue")
      .mockImplementation(() => () => mockConfigValue);
});

afterEach(() => {
  mockConfigValue = false;
  talkSpy.mockRestore();
  beepSpy.mockRestore();
  dispatchNetworkUpSpy.mockRestore();
  dispatchNetworkDownSpy.mockRestore();
  forceOnlineSpy.mockRestore();
  getWebAppConfigValueSpy.mockRestore();
});

describe("incomingStatus", () => {
  it("creates an action", () => {
    const stub = {} as HardwareState;
    const result = incomingStatus(stub);
    expect(result.type).toEqual(Actions.STATUS_UPDATE);
    expect(result.payload).toEqual(stub);
  });
});

function fakeLog(meta_type: ALLOWED_MESSAGE_TYPES,
  channels: ALLOWED_CHANNEL_NAMES[] = ["toast"]): Log {
  return {
    message: "toasty!",
    type: meta_type,
    channels,
    created_at: -1
  };
}

describe("actOnChannelName()", () => {
  it("skips irrelevant channels like `email`", () => {
    const callback = jest.fn();
    actOnChannelName(fakeLog(MessageType.success, ["email"]), "toast", callback);
    expect(callback).not.toHaveBeenCalled();
  });

  it("executes callback for `toast` type", () => {
    const callback = jest.fn();
    const fakeToast = fakeLog(MessageType.success, ["toast", "email"]);
    actOnChannelName(fakeToast, "toast", callback);
    expect(callback).toHaveBeenCalledWith(fakeToast);
  });
});

describe("showLogOnScreen", () => {

  function assertToastr(types: ALLOWED_MESSAGE_TYPES[], toastr: Function) {
    jest.clearAllMocks();
    types.map((x) => {
      const log = fakeLog(x, ["toast"]);
      showLogOnScreen(log);
      expect(toastr).toHaveBeenCalledWith(log.message, TITLE());
    });
  }

  it("routes `info` and all others to toastr.info()", () => {
    assertToastr([
      MessageType.info,
      ("FOO" as ALLOWED_MESSAGE_TYPES)], info);
  });

  it("routes `error` to toastr.error()", () => {
    assertToastr([MessageType.error], error);
  });

  it("routes `warn` to toastr.warning()", () => {
    assertToastr([MessageType.warn], warning);
  });

  it("routes `busy` to toastr.busy()", () => {
    assertToastr([MessageType.busy], busy);
  });

  it("routes `fun` to toastr.fun()", () => {
    assertToastr([MessageType.fun], fun);
  });

  it("routes `success` to toastr.success()", () => {
    assertToastr([MessageType.success], success);
  });

  it("routes `debug` to toastr.info()", () => {
    const log = fakeLog(MessageType.debug, ["toast"]);
    showLogOnScreen(log);
    expect(info).toHaveBeenCalledWith(log.message, {
      title: TITLE(), color: "gray",
    });
  });
});

describe("speakLogAloud", () => {
  const fakeSpeakLog = fakeLog(MessageType.info);
  fakeSpeakLog.message = "hello";

  it("doesn't call browser-speech", () => {
    mockConfigValue = false;
    const speak = speakLogAloud(jest.fn());
    speak(fakeSpeakLog);
    expect(talkSpy).not.toHaveBeenCalled();
  });

  it("calls browser-speech", () => {
    mockConfigValue = true;
    const speak = speakLogAloud(jest.fn());
    speak(fakeSpeakLog);
    expect(talkSpy).toHaveBeenCalledWith("hello", expect.any(String));
    const lang = talkSpy.mock.calls[0]?.[1];
    expect(lang?.length).toEqual(2);
  });
});

describe("logBeep()", () => {
  const makeLog = () => {
    const log = fakeLog(MessageType.info);
    log.verbosity = 2;
    return log;
  };

  it("doesn't beep: off", () => {
    mockConfigValue = 0;
    const log = makeLog();
    logBeep(jest.fn())(log);
    expect(beepSpy).not.toHaveBeenCalled();
  });

  it("doesn't beep: lower verbosity", () => {
    mockConfigValue = 1;
    const log = makeLog();
    logBeep(jest.fn())(log);
    expect(beepSpy).not.toHaveBeenCalled();
  });

  it("beeps", () => {
    mockConfigValue = 2;
    const log = makeLog();
    logBeep(jest.fn())(log);
    expect(beepSpy).toHaveBeenCalledWith(MessageType.info);
  });

  it("handles unknown verbosity", () => {
    mockConfigValue = 2;
    const log = makeLog();
    log.verbosity = undefined;
    logBeep(jest.fn())(log);
    expect(beepSpy).toHaveBeenCalledWith(MessageType.info);
  });
});

describe("initLog", () => {
  it("creates a Redux action (new log)", () => {
    const log = fakeLog(MessageType.error);
    const action = initLog(log);
    const payload = action.payload as TaggedLog;
    expect(action.payload.kind).toBe("Log");
    expect(payload.body.message).toBe(log.message);
  });
});

describe("bothUp()", () => {
  it("marks MQTT and API as up", () => {
    bothUp();
    expect(dispatchNetworkUpSpy).toHaveBeenCalledWith("user.mqtt", ANY_NUMBER);
  });
});

describe("onOffline", () => {
  it("tells the app MQTT is down", () => {
    forceOnlineSpy.mockReturnValue(false);
    jest.clearAllMocks();
    onOffline();
    expect(dispatchNetworkDownSpy).toHaveBeenCalledWith("user.mqtt", ANY_NUMBER);
    expect(error).toHaveBeenCalledWith(
      Content.MQTT_DISCONNECTED, { idPrefix: "offline" });
  });

  it("doesn't show toast", () => {
    forceOnlineSpy.mockReturnValue(true);
    jest.clearAllMocks();
    onOffline();
    expect(error).not.toHaveBeenCalled();
  });
});

describe("onOnline", () => {
  it("tells the app MQTT is up", () => {
    forceOnlineSpy.mockReturnValue(false);
    jest.clearAllMocks();
    onOnline();
    expect(dispatchNetworkUpSpy).toHaveBeenCalledWith("user.mqtt", ANY_NUMBER);
    expect(removeToast).toHaveBeenCalledWith("offline");
    expect(success).toHaveBeenCalled();
  });

  it("doesn't show toast", () => {
    forceOnlineSpy.mockReturnValue(true);
    jest.clearAllMocks();
    onOnline();
    expect(success).not.toHaveBeenCalled();
  });
});

describe("onReconnect()", () => {
  it("sends reconnect toast", () => {
    forceOnlineSpy.mockReturnValue(false);
    onReconnect();
    expect(warning).toHaveBeenCalledWith(
      "Attempting to reconnect to the message broker",
      { title: "Offline", color: "yellow", idPrefix: "offline" });
  });

  it("doesn't show toast", () => {
    forceOnlineSpy.mockReturnValue(true);
    onReconnect();
    expect(warning).not.toHaveBeenCalled();
  });
});

describe("changeLastClientConnected", () => {
  it("tells farmbot when the last browser session was opened", () => {
    const setUserEnv = jest.fn((_) => Promise.resolve({}));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fakeFarmbot = { setUserEnv: setUserEnv as any } as Farmbot;
    changeLastClientConnected(fakeFarmbot)();
    expect(setUserEnv).toHaveBeenCalledWith(expect.objectContaining({
      "LAST_CLIENT_CONNECTED": expect.any(String)
    }));
  });
});

describe("onSent", () => {
  it("marks MQTT as up", () => {
    jest.clearAllMocks();
    onSent({ connected: true })();
    expect(dispatchNetworkUpSpy).toHaveBeenCalledWith("user.mqtt", ANY_NUMBER);
  });

  it("marks MQTT as down", () => {
    jest.clearAllMocks();
    onSent({ connected: false })();
    expect(dispatchNetworkDownSpy)
      .toHaveBeenCalledWith("user.mqtt", ANY_NUMBER);
  });
});

describe("onMalformed()", () => {
  it("handles malformed messages", () => {
    const dispatch = jest.fn();
    const state = fakeState();
    state.bot.alreadyToldUserAboutMalformedMsg = false;
    onMalformed(dispatch, () => state)();
    expect(warning)
      .toHaveBeenCalledWith(Content.MALFORMED_MESSAGE_REC_UPGRADE);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_MALFORMED_NOTIFICATION_SENT, payload: true,
    });
    jest.clearAllMocks();
    state.bot.alreadyToldUserAboutMalformedMsg = true;
    onMalformed(dispatch, () => state)();
    expect(warning) // Only fire once.
      .not
      .toHaveBeenCalledWith(Content.MALFORMED_MESSAGE_REC_UPGRADE);
    expect(dispatch).not.toHaveBeenCalled();
  });
});

describe("onPublicBroadcast", () => {
  const expectBroadcastLog = () =>
    expect(console.log).toHaveBeenCalledWith(
      FbjsEventName.publicBroadcast, expect.any(Object));

  describe("onLogs", () => {
    it("calls `networkUp` when good logs come in", () => {
      const dispatch = jest.fn();
      const fn = onLogs(dispatch, fakeState);
      const log = fakeLog(MessageType.error, []);
      log.message = "bot xyz is offline";
      const taggedLog = fn(log);
      const getStateSpy =
        jest.spyOn(store, "getState").mockReturnValue(fakeState() as never);
      globalQueue.maybeWork();
      getStateSpy.mockRestore();
      expect(taggedLog?.kind).toEqual("Log");
    });
  });

  it("triggers when appropriate", () => {
    window.confirm = jest.fn(() => true);
    console.log = jest.fn();
    onPublicBroadcast({});
    expectBroadcastLog();
    expect(window.confirm).toHaveBeenCalledWith(Content.FORCE_REFRESH_CONFIRM);
    expect(location.assign).toHaveBeenCalled();
  });

  it("allows cancellation of refresh", () => {
    window.confirm = jest.fn(() => false);
    window.alert = jest.fn();
    console.log = jest.fn();
    onPublicBroadcast({});
    expectBroadcastLog();
    expect(window.alert).toHaveBeenCalledWith(
      Content.FORCE_REFRESH_CANCEL_WARNING);
    expect(location.assign).not.toHaveBeenCalled();
  });
});
