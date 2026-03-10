import {
  onStatus,
  incomingStatus,
} from "../../connect_device";
import * as slowDownModule from "../../slow_down";
import { fakeState } from "../../../__test_support__/fake_state";
import * as deviceActions from "../../../devices/actions";
import { Actions } from "../../../constants";

let badVersionSpy: jest.SpyInstance;
let slowDownSpy: jest.SpyInstance;

describe("onStatus()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete globalConfig.MINIMUM_FBOS_VERSION;
    slowDownSpy = jest.spyOn(slowDownModule, "slowDown")
      .mockImplementation((fn: Function) => fn as never);
    badVersionSpy =
      jest.spyOn(deviceActions, "badVersion").mockImplementation(jest.fn());
  });

  afterEach(() => {
    slowDownSpy.mockRestore();
    badVersionSpy.mockRestore();
  });

  const callOnStatus = (version: string | undefined, dispatch: Function) => {
    const state = fakeState();
    state.bot.hardware.informational_settings.controller_version = version;
    state.bot.needVersionCheck = true;
    onStatus(dispatch, () => state)(state.bot.hardware);
  };

  it("warns about old version", () => {
    const dispatch = jest.fn();
    callOnStatus("0.0.0", dispatch);
    expect(deviceActions.badVersion).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_NEEDS_VERSION_CHECK, payload: false,
    });
  });

  it("doesn't warn about old version", () => {
    const dispatch = jest.fn();
    callOnStatus(undefined, dispatch);
    expect(deviceActions.badVersion).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalledWith({
      type: Actions.SET_NEEDS_VERSION_CHECK, payload: false,
    });
  });

  it("version ok", () => {
    const dispatch = jest.fn();
    globalConfig.MINIMUM_FBOS_VERSION = "1.0.0";
    callOnStatus("1.0.0", dispatch);
    expect(deviceActions.badVersion).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_NEEDS_VERSION_CHECK, payload: false,
    });
    delete globalConfig.MINIMUM_FBOS_VERSION;
  });

  it("handles incoming statuses", () => {
    const state = fakeState(() => state);
    const getState = jest.fn(() => state);
    const dispatch = jest.fn();
    const fake = state.bot.hardware;
    expect(slowDownSpy).not.toHaveBeenCalled();
    onStatus(dispatch, getState)(fake);
    expect(dispatch)
      .toHaveBeenCalledWith(incomingStatus(state.bot.hardware));
  });
});
