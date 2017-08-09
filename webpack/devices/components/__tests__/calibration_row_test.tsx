jest.mock("../../../device", () => ({
  devices: {
    current: {
      calibrate: jest.fn()
    }
  }
}));
import * as React from "react";
import { mount } from "enzyme";
import { CalibrationRow } from "../calibration_row";
import { bot } from "../../../__test_support__/fake_state/bot";
import { devices } from "../../../device";

describe("<HomingRow />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });
  it("calls device", () => {
    let { mock } = devices.current.calibrate as jest.Mock<{}>;
    let result = mount(<CalibrationRow hardware={bot.hardware.mcu_params} />);
    result.find("LockableButton").at(0).simulate("click");
    result.find("LockableButton").at(1).simulate("click");
    result.find("LockableButton").at(2).simulate("click");
    expect(mock.calls.length).toEqual(2);
    expect(mock.calls[0][0].axis).toEqual("x");
    expect(mock.calls[1][0].axis).toEqual("y");
  });
});
