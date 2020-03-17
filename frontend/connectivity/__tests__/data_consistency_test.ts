jest.mock("../../device", () => {
  const on = jest.fn();
  return { getDevice: () => ({ on }) };
});

const mockConsistency = { value: true };

jest.mock("../../redux/store", () => {
  return {
    store: {
      dispatch: jest.fn(),
      getState() {
        return { bot: { consistent: mockConsistency.value } };
      }
    }
  };
});

import { getDevice } from "../../device";
import { store } from "../../redux/store";
import { Actions } from "../../constants";
import {
  startTracking, outstandingRequests, stopTracking, cleanUUID,
} from "../data_consistency";

const unprocessedUuid = "~UU.ID~";
const niceUuid = cleanUUID(unprocessedUuid);

describe("startTracking", () => {
  it("dispatches actions / event handlers", () => {
    const b4 = outstandingRequests.all.size;
    startTracking(unprocessedUuid);
    expect(store.dispatch)
      .toHaveBeenCalledWith({ type: Actions.SET_CONSISTENCY, payload: false });
    expect(getDevice().on).toHaveBeenCalledWith(niceUuid, expect.anything());
    expect(outstandingRequests.all.size).toBe(b4 + 1);
  });
});

describe("stopTracking", () => {
  it("dispatches actions / event handlers", () => {
    const b4 = outstandingRequests.all.size;
    mockConsistency.value = false;
    stopTracking(unprocessedUuid);
    expect(store.dispatch)
      .toHaveBeenCalledWith({ type: Actions.SET_CONSISTENCY, payload: true });
    expect(outstandingRequests.all.size).toBe(b4 - 1);
  });
});
