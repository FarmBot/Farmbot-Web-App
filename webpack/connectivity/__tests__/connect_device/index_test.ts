import { HardwareState } from "../../../devices/interfaces";
import { incomingStatus, ifToastWorthy } from "../../connect_device";
import { Actions } from "../../../constants";
import { Log } from "../../../interfaces";
import { ALLOWED_CHANNEL_NAMES, ALLOWED_MESSAGE_TYPES } from "farmbot";

describe("incomingStatus", () => {
  it("creates an action", () => {
    const stub = {} as HardwareState;
    const result = incomingStatus(stub);
    expect(result.type).toEqual(Actions.BOT_CHANGE);
    expect(result.payload).toEqual(stub);
  });
});

describe("ifToast", () => {
  function log(meta_type: ALLOWED_MESSAGE_TYPES,
    channels: ALLOWED_CHANNEL_NAMES[] = ["toast"]): Log {
    return {
      message: "toasty!",
      meta: { type: meta_type },
      channels,
      created_at: -1
    };
  }

  it("skips irrelevant channels like `email`", () => {
    const callback = jest.fn();
    ifToastWorthy(log("success", ["email"]), callback);
    expect(callback).not.toHaveBeenCalled();
  });

  it("executes callback only for `toast` types", () => {
    const callback = jest.fn();
    const fakeToast = log("success", ["toast", "email"]);
    ifToastWorthy(fakeToast, callback);
    expect(callback).toHaveBeenCalledWith(fakeToast);
  });
});
