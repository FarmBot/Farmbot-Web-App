const mockOn = jest.fn();
jest.mock("../../device", () => ({
  getDevice: () => ({ on: mockOn }),
}));

const mockConsistency = { value: true };
jest.mock("../../redux/store", () => ({
  store: {
    dispatch: jest.fn(),
    getState: () => ({ bot: { consistent: mockConsistency.value } }),
  }
}));

import { getDevice } from "../../device";
import { store } from "../../redux/store";
import { Actions } from "../../constants";
import {
  startTracking, outstandingRequests, stopTracking, cleanUUID, MAX_WAIT,
} from "../data_consistency";

const unprocessedUuid = "~UU.ID~";
const niceUuid = cleanUUID(unprocessedUuid);

describe("startTracking", () => {
  it("dispatches actions / event handlers: stop after timeout", () => {
    jest.useFakeTimers();
    const b4 = outstandingRequests.all.size;
    startTracking(unprocessedUuid);
    expect(store.dispatch)
      .toHaveBeenCalledWith({ type: Actions.SET_CONSISTENCY, payload: false });
    expect(getDevice().on).toHaveBeenCalledWith(niceUuid, expect.any(Function));
    expect(outstandingRequests.all.size).toBe(b4 + 1);
    jest.advanceTimersByTime(MAX_WAIT + 10);
    expect(outstandingRequests.all.size).toBe(b4);
  });

  it("dispatches actions / event handlers: stop after bot.on", () => {
    const b4 = outstandingRequests.all.size;
    startTracking(unprocessedUuid);
    expect(store.dispatch)
      .toHaveBeenCalledWith({ type: Actions.SET_CONSISTENCY, payload: false });
    expect(getDevice().on).toHaveBeenCalledWith(niceUuid, expect.any(Function));
    expect(outstandingRequests.all.size).toBe(b4 + 1);
    mockOn.mock.calls[0][1]();
    expect(outstandingRequests.all.size).toBe(b4);
  });
});

describe("stopTracking", () => {
  it("dispatches actions / event handlers", () => {
    startTracking(unprocessedUuid);
    const b4 = outstandingRequests.all.size;
    mockConsistency.value = false;
    stopTracking(unprocessedUuid);
    expect(store.dispatch)
      .toHaveBeenCalledWith({ type: Actions.SET_CONSISTENCY, payload: true });
    expect(outstandingRequests.all.size).toBe(b4 - 1);
  });
});
