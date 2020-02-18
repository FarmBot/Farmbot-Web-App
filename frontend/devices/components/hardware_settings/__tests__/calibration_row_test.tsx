import * as React from "react";
import { mount } from "enzyme";
import { CalibrationRow } from "../calibration_row";
import { bot } from "../../../../__test_support__/fake_state/bot";
import { CalibrationRowProps } from "../../interfaces";
import { DeviceSetting } from "../../../../constants";

describe("<CalibrationRow />", () => {
  const fakeProps = (): CalibrationRowProps => ({
    type: "calibrate",
    hardware: bot.hardware.mcu_params,
    botDisconnected: false,
    action: jest.fn(),
    toolTip: "calibrate",
    title: DeviceSetting.calibration,
    axisTitle: "calibrate",
  });

  it("calls device", () => {
    const p = fakeProps();
    const result = mount(<CalibrationRow {...p} />);
    p.hardware.encoder_enabled_x = 1;
    p.hardware.encoder_enabled_y = 1;
    p.hardware.encoder_enabled_z = 0;
    [0, 1, 2].map(i => result.find("LockableButton").at(i).simulate("click"));
    expect(p.action).toHaveBeenCalledTimes(2);
    ["y", "x"].map(x => expect(p.action).toHaveBeenCalledWith(x));
  });

  it("is not disabled", () => {
    const p = fakeProps();
    p.type = "zero";
    const result = mount(<CalibrationRow {...p} />);
    p.hardware.encoder_enabled_x = 0;
    p.hardware.encoder_enabled_y = 1;
    p.hardware.encoder_enabled_z = 0;
    [0, 1, 2].map(i => result.find("LockableButton").at(i).simulate("click"));
    expect(p.action).toHaveBeenCalledTimes(3);
    ["x", "y", "z"].map(x => expect(p.action).toHaveBeenCalledWith(x));
  });
});
