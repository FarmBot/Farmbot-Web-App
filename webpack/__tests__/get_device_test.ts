// tslint:disable-next-line:class-name
class mockFarmbot { connect = () => Promise.resolve(this); }

jest.mock("farmbot", () => {
  return { Farmbot: mockFarmbot };
});

import { getDevice } from "../device";

describe("getDevice()", () => {
  it("crashes if you call getDevice() too soon in the app lifecycle", () => {
    expect(() => getDevice()).toThrow("NO DEVICE SET");
  });
});
