jest.mock("../../slow_down", () => ({
  slowDown: jest.fn((fn: Function) => fn)
}));

jest.mock("../../../devices/actions", () => ({ badVersion: jest.fn() }));

import {
  onStatus,
  incomingStatus,
  HACKY_FLAGS,
} from "../../connect_device";
import { slowDown } from "../../slow_down";
import { fakeState } from "../../../__test_support__/fake_state";
import { badVersion } from "../../../devices/actions";

describe("onStatus()", () => {
  const callOnStatus = (version: string | undefined) => {
    HACKY_FLAGS.needVersionCheck = true;
    const dispatch = jest.fn();
    const state = fakeState();
    state.bot.hardware.informational_settings.controller_version = version;
    onStatus(dispatch, () => state)(state.bot.hardware);
  };

  it("warns about old version", () => {
    callOnStatus("0.0.0");
    expect(badVersion).toHaveBeenCalled();
  });

  it("doesn't warn about old version", () => {
    callOnStatus(undefined);
    expect(badVersion).not.toHaveBeenCalled();
  });

  it("version ok", () => {
    globalConfig.MINIMUM_FBOS_VERSION = "1.0.0";
    callOnStatus("1.0.0");
    expect(badVersion).not.toHaveBeenCalled();
    delete globalConfig.MINIMUM_FBOS_VERSION;
  });

  it("handles incoming statuses", () => {
    const state = fakeState(() => state);
    const getState = jest.fn(() => state);
    const dispatch = jest.fn();
    const fake = state.bot.hardware;
    expect(slowDown).not.toHaveBeenCalled();
    onStatus(dispatch, getState)(fake);
    expect(dispatch)
      .toHaveBeenCalledWith(incomingStatus(state.bot.hardware));
  });
});
