jest.mock("../../../device", () => ({
  devices: {
    current: {
      setZero: jest.fn()
    }
  }
}));
import * as React from "react";
import { mount } from "enzyme";
import { ZeroRow } from "../zero_row";
import { bot } from "../../../__test_support__/fake_state/bot";
import { devices } from "../../../device";

describe("<HomingRow />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });
  it("calls device", () => {
    let { mock } = devices.current.setZero as jest.Mock<{}>;
    let result = mount(<ZeroRow />);
    let thunkx = result.find("ZeroButton").at(0).simulate("click");
    let thunky = result.find("ZeroButton").at(1).simulate("click");
    let thunkz = result.find("ZeroButton").at(2).simulate("click");
    expect(mock.calls.length).toEqual(3);
    expect(mock.calls[0][0]).toEqual("x");
    expect(mock.calls[1][0]).toEqual("y");
    expect(mock.calls[2][0]).toEqual("z");
  });
});
