jest.mock("../../slow_down", () => ({
  slowDown: jest.fn((fn: Function) => fn)
}));

jest.mock("../../../devices/actions", () => ({ badVersion: jest.fn() }));

import {
  incomingLegacyStatus,
  onStatus,
} from "../../connect_device";
import { slowDown } from "../../slow_down";
import { fakeState } from "../../../__test_support__/fake_state";

describe("onStatus()", () => {
  it("handles incoming statuses", () => {
    const state = fakeState(() => state);
    const getState = jest.fn(() => state);
    const dispatch = jest.fn();
    const fake = state.bot.hardware;
    expect(slowDown).not.toHaveBeenCalled();
    onStatus(dispatch, getState)(fake);
    expect(dispatch)
      .toHaveBeenCalledWith(incomingLegacyStatus(state.bot.hardware));
  });
});
