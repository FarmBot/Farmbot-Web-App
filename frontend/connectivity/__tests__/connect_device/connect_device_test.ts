import { fetchNewDevice } from "../../../device";
import * as deviceModule from "../../../device";
import { connectDevice } from "../../connect_device";
import { DeepPartial } from "../../../redux/interfaces";
import { AuthState } from "../../../auth/interfaces";
import { fakeState } from "../../../__test_support__/fake_state";

let fetchNewDeviceSpy: jest.SpyInstance;

beforeEach(() => {
  fetchNewDeviceSpy = jest.spyOn(deviceModule, "fetchNewDevice")
    .mockImplementation(() => Promise.resolve({} as unknown as import("farmbot").Farmbot));
});

afterEach(() => {
  fetchNewDeviceSpy.mockRestore();
});
describe("connectDevice()", () => {
  it("connects a FarmBot to the network", async () => {
    const auth: DeepPartial<AuthState> = { token: {} };
    const dispatch = jest.fn();
    const getState = jest.fn(() => fakeState());
    const fn = connectDevice(auth as AuthState);

    await fn(dispatch, getState);
    expect(fetchNewDevice).toHaveBeenCalledWith(auth);
  });
});
