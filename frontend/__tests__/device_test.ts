class mockFarmbot { connect = () => Promise.resolve(this); }
jest.mock("farmbot", () => ({ Farmbot: mockFarmbot }));

import { fetchNewDevice, getDevice } from "../device";
import { auth } from "../__test_support__/fake_state/token";
import { get } from "lodash";

describe("getDevice()", () => {
  it("crashes if you call getDevice() too soon in the app lifecycle", () => {
    expect(() => getDevice()).toThrow("NO DEVICE SET");
  });
});

describe("fetchNewDevice", () => {
  it("returns an instance of FarmBot", async () => {
    const bot = await fetchNewDevice(auth);
    expect(bot).toBeInstanceOf(mockFarmbot);
    // We use this for debugging in local dev env
    expect(get(global, "current_bot")).toBeDefined();
  });
});
