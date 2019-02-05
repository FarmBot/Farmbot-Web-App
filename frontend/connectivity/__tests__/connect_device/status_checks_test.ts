jest.mock("../../slow_down", () => {
  return {
    slowDown: jest.fn((fn: Function) => fn),
  };
});

import {
  onStatus,
  incomingStatus,
  incomingLegacyStatus,
  onLegacyStatus
} from "../../connect_device";
import { slowDown } from "../../slow_down";
import { fakeState } from "../../../__test_support__/fake_state";

describe("onStatus()", () => {
  it("handles incoming statuses", () => {
    const state = fakeState(() => state);
    const getState = jest.fn(() => state);
    const dispatch = jest.fn();
    const fake = {
      location_data: {
        position: {
          x: 1,
          y: 2,
          z: 3
        }
      }
    };
    expect(slowDown).not.toHaveBeenCalled();
    onStatus(dispatch, getState)(fake);
    expect(dispatch).toHaveBeenCalledWith(incomingStatus(fake));
  });
});

describe("onLegacyStatus()", () => {
  it("handles incoming statuses", () => {
    const state = fakeState(() => state);
    const getState = jest.fn(() => state);
    const dispatch = jest.fn();
    const fake = state.bot.hardware;
    expect(slowDown).not.toHaveBeenCalled();
    onLegacyStatus(dispatch, getState)(fake);
    expect(dispatch)
      .toHaveBeenCalledWith(incomingLegacyStatus(state.bot.hardware));
  });
});
