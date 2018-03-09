const mockDevice = {
  calibrate: jest.fn()
};
jest.mock("../../../../device", () => ({
  getDevice: () => (mockDevice)
}));
import * as React from "react";
import { mount } from "enzyme";
import { CalibrationRow } from "../calibration_row";
import { bot } from "../../../../__test_support__/fake_state/bot";

describe("<HomingRow />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });
  it("calls device", () => {
    const result = mount(<CalibrationRow
      hardware={bot.hardware.mcu_params}
      botDisconnected={false} />);
    [0, 1, 2].map(i => result.find("LockableButton").at(i).simulate("click"));
    expect(mockDevice.calibrate).toHaveBeenCalledTimes(2);
    [{ axis: "y" }, { axis: "x" }].map(x =>
      expect(mockDevice.calibrate).toHaveBeenCalledWith(x));
  });
});
