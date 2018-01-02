// tslint:disable-next-line:class-name
class mockFarmbot { connect = () => Promise.resolve(this); }

jest.mock("farmbot", () => {
  return { Farmbot: mockFarmbot };
});

import { fetchNewDevice, getDevice } from "../device";
import { auth } from "../__test_support__/fake_state/token";

describe("getDevice()", () => {
  it("crashes if you call getDevice() too soon in the app lifecycle", () => {
    expect(() => getDevice()).toThrow("NO DEVICE SET");
  });
});
