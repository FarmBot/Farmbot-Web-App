jest.mock("farmbot-toastr", () => ({
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn()
}));

jest.mock("../../index", () => ({
  dispatchNetworkUp: jest.fn(),
  dispatchNetworkDown: jest.fn()
}));

const mockDevice = {
  readStatus: jest.fn(() => Promise.resolve()),
};

jest.mock("../../../device", () => ({
  getDevice: () => (mockDevice)
}));

import { HardwareState } from "../../../devices/interfaces";
import {
  incomingStatus,
  ifToastWorthy,
  showLogOnScreen,
  TITLE,
  bothUp,
  initLog,
  readStatus,
  onOffline,
  changeLastClientConnected,
  onSent,
  onOnline,
  onMalformed
} from "../../connect_device";
import { Actions, Content } from "../../../constants";
import { Log } from "../../../interfaces";
import { ALLOWED_CHANNEL_NAMES, ALLOWED_MESSAGE_TYPES, Farmbot } from "farmbot";
import { success, error, info, warning } from "farmbot-toastr";
import { dispatchNetworkUp, dispatchNetworkDown } from "../../index";
import { getDevice } from "../../../device";

describe("readStatus()", () => {
  it("forces a read_status request to FarmBot", () => {
    readStatus();
    expect(getDevice().readStatus).toHaveBeenCalled();
  });
});

describe("incomingStatus", () => {
  it("creates an action", () => {
    const stub = {} as HardwareState;
    const result = incomingStatus(stub);
    expect(result.type).toEqual(Actions.BOT_CHANGE);
    expect(result.payload).toEqual(stub);
  });
});

function fakeLog(meta_type: ALLOWED_MESSAGE_TYPES,
  channels: ALLOWED_CHANNEL_NAMES[] = ["toast"]): Log {
  return {
    message: "toasty!",
    meta: { type: meta_type },
    channels,
    created_at: -1
  };
}

describe("ifToast", () => {
  it("skips irrelevant channels like `email`", () => {
    const callback = jest.fn();
    ifToastWorthy(fakeLog("success", ["email"]), callback);
    expect(callback).not.toHaveBeenCalled();
  });

  it("executes callback only for `toast` types", () => {
    const callback = jest.fn();
    const fakeToast = fakeLog("success", ["toast", "email"]);
    ifToastWorthy(fakeToast, callback);
    expect(callback).toHaveBeenCalledWith(fakeToast);
  });
});

describe("showLogOnScreen", () => {

  function assertToastr(types: ALLOWED_MESSAGE_TYPES[], toastr: Function) {
    jest.resetAllMocks();
    types.map((x) => {
      const fun = fakeLog(x, ["toast"]);
      showLogOnScreen(fun);
      expect(toastr).toHaveBeenCalledWith(fun.message, TITLE);
    });
  }

  it("routes `fun`, `info` and all others to toastr.info()", () => {
    assertToastr(["fun", "info", ("FOO" as ALLOWED_MESSAGE_TYPES)], info);
  });

  it("routes `busy`, `warn` and `error` to toastr.error()", () => {
    assertToastr(["busy", "warn", "error"], error);
  });

  it("routes `success` to toastr.success()", () => {
    assertToastr(["success"], success);
  });
});

describe("initLog", () => {
  it("creates a Redux action (new log)", () => {
    const log = fakeLog("error");
    const action = initLog(log);
    expect(action.payload.kind).toBe("Log");
    // expect(action.payload.specialStatus).toBe(undefined);
    if (action.payload.kind === "Log") {
      expect(action.payload.body.message).toBe(log.message);
    } else {
      fail();
    }
  });
});

describe("bothUp()", () => {
  it("marks MQTT and API as up", () => {
    bothUp();
    expect(dispatchNetworkUp).toHaveBeenCalledWith("user.mqtt");
    expect(dispatchNetworkUp).toHaveBeenCalledWith("bot.mqtt");
  });
});

describe("onOffline", () => {
  it("tells the app MQTT is down", () => {
    jest.resetAllMocks();
    onOffline();
    expect(dispatchNetworkDown).toHaveBeenCalledWith("user.mqtt");
    expect(error).toHaveBeenCalledWith(Content.MQTT_DISCONNECTED);
  });
});

describe("onOnline", () => {
  it("tells the app MQTT is up", () => {
    jest.resetAllMocks();
    onOnline();
    expect(dispatchNetworkUp).toHaveBeenCalledWith("user.mqtt");
  });
});

describe("changeLastClientConnected", () => {
  it("tells farmbot when the last browser session was opened", () => {
    const setUserEnv = jest.fn();
    const fakeFarmbot = { setUserEnv: setUserEnv as any } as Farmbot;
    changeLastClientConnected(fakeFarmbot)();
    expect(fakeFarmbot.setUserEnv)
      .toHaveBeenCalled();
    expect(Object.keys(setUserEnv.mock.calls[0][0]))
      .toContain("LAST_CLIENT_CONNECTED");
  });
});

describe("onSent", () => {
  it("marks MQTT as up", () => {
    jest.resetAllMocks();
    onSent({ connected: true })();
    expect(dispatchNetworkUp).toHaveBeenCalledWith("user.mqtt");
  });

  it("marks MQTT as down", () => {
    jest.resetAllMocks();
    onSent({ connected: false })();
    expect(dispatchNetworkDown).toHaveBeenCalledWith("user.mqtt");
  });
});

describe("onMalformed()", () => {
  it("handles malformed messages", () => {
    onMalformed();
    expect(warning)
      .toHaveBeenCalledWith(Content.MALFORMED_MESSAGE_REC_UPGRADE);
    jest.resetAllMocks();
    onMalformed();
    expect(warning) // Only fire once.
      .not
      .toHaveBeenCalledWith(Content.MALFORMED_MESSAGE_REC_UPGRADE);
  });
});
