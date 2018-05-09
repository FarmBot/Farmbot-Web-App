const mockDevice = {
  setZero: jest.fn(() => Promise.resolve())
};
jest.mock("../../../../device", () => ({
  getDevice: () => (mockDevice)
}));
import * as React from "react";
import { mount } from "enzyme";
import { ZeroRow } from "../zero_row";

describe("<HomingRow />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });
  it("calls device", () => {
    const result = mount(<ZeroRow botDisconnected={false} />);
    [0, 1, 2].map(i => result.find("ZeroButton").at(i).simulate("click"));
    ["x", "y", "z"].map(x =>
      expect(mockDevice.setZero).toHaveBeenCalledWith(x));
    expect(mockDevice.setZero).toHaveBeenCalledTimes(3);
  });
});
