class mockFarmbot { connect = () => Promise.resolve(this); }
jest.mock("farmbot", () => ({
  ...(jest.requireActual("farmbot") as object),
  Farmbot: mockFarmbot,
}));

import { auth } from "../__test_support__/fake_state/token";
import { get } from "lodash";

const loadDeviceModule = async () => {
  return await import(`../device?test=${Math.random()}`);
};

describe("getDevice()", () => {
  it("crashes if you call getDevice() too soon in the app lifecycle", async () => {
    const { getDevice } = await loadDeviceModule();
    expect(() => getDevice()).toThrow("NO DEVICE SET");
  });
});

describe("fetchNewDevice", () => {
  it("returns an instance of FarmBot", async () => {
    const { fetchNewDevice } = await loadDeviceModule();
    const bot = await fetchNewDevice(auth);
    expect(bot).toBeInstanceOf(mockFarmbot);
    // We use this for debugging in local dev env
    expect(get(global, "current_bot")).toBeDefined();
  });
});
