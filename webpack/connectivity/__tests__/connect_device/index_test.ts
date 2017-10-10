jest.mock("farmbot-toastr", () => ({
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn()
}));

jest.mock("../../index", () => ({
  dispatchNetworkUp: jest.fn()
}));

import { HardwareState } from "../../../devices/interfaces";
import {
  incomingStatus,
  ifToastWorthy,
  showLogOnScreen,
  TITLE,
  bothUp,
  initLog
} from "../../connect_device";
import { Actions } from "../../../constants";
import { Log } from "../../../interfaces";
import { ALLOWED_CHANNEL_NAMES, ALLOWED_MESSAGE_TYPES } from "farmbot";
import { success, error, info } from "farmbot-toastr";
import { dispatchNetworkUp } from "../../index";

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
    expect(action.payload.kind).toBe("logs");
    // expect(action.payload.specialStatus).toBe(undefined);
    if (action.payload.kind === "logs") {
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
