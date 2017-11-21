jest.mock("../../device", () => {
  const on = jest.fn();
  return { getDevice: () => ({ on }) };
});

jest.mock("../../redux/store", () => {
  return {
    store: {
      dispatch: jest.fn()
    }
  };
});

import { getDevice } from "../../device";
import { store } from "../../redux/store";
import { Actions } from "../../constants";
import { startTracking, outstandingRequests } from "../data_consistency";

describe("startTracking", () => {
  it("dispatches actions / event handlers", () => {
    const uuid = "~UUID~";
    const b4 = outstandingRequests.size;
    startTracking(uuid);
    expect(store.dispatch)
      .toHaveBeenCalledWith({ type: Actions.SET_CONSISTENCY, payload: false });
    expect(getDevice().on).toHaveBeenCalledWith(uuid, expect.anything());
    expect(outstandingRequests.size).toBe(b4 + 1);
  });
});
