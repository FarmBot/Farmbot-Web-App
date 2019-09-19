jest.mock("../../../device", () => {
  return {
    fetchNewDevice: jest.fn(() => Promise.resolve({}))
  };
});

import { fetchNewDevice } from "../../../device";
import { connectDevice } from "../../connect_device";
import { DeepPartial } from "redux";
import { AuthState } from "../../../auth/interfaces";
import { fakeState } from "../../../__test_support__/fake_state";

describe("connectDevice()", async () => {
  it("connects a FarmBot to the network", async () => {
    const auth: DeepPartial<AuthState> = { token: {} };
    const dispatch = jest.fn();
    const getState = jest.fn(() => fakeState());
    const fn = connectDevice(auth as AuthState);

    await fn(dispatch, getState);
    expect(fetchNewDevice).toHaveBeenCalledWith(auth);
  });
});
