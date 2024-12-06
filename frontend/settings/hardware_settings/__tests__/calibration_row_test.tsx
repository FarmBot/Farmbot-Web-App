import React from "react";
import { mount } from "enzyme";
import { CalibrationRow } from "../calibration_row";
import { bot } from "../../../__test_support__/fake_state/bot";
import { CalibrationRowProps } from "../interfaces";
import { DeviceSetting } from "../../../constants";

describe("<CalibrationRow />", () => {
  const fakeProps = (): CalibrationRowProps => ({
    type: "calibrate",
    mcuParams: bot.hardware.mcu_params,
    arduinoBusy: false,
    botOnline: true,
    action: jest.fn(),
    toolTip: "calibrate",
    title: DeviceSetting.findAxisLength,
    axisTitle: "calibrate",
  });

  it("calls device", () => {
    const p = fakeProps();
    const result = mount(<CalibrationRow {...p} />);
    p.mcuParams.encoder_enabled_x = 1;
    p.mcuParams.encoder_enabled_y = 1;
    p.mcuParams.encoder_enabled_z = 0;
    [0, 1, 2].map(i => result.find("LockableButton").at(i).simulate("click"));
    expect(p.action).toHaveBeenCalledTimes(2);
    ["y", "x"].map(x => expect(p.action).toHaveBeenCalledWith(x));
  });

  it("is not disabled", () => {
    const p = fakeProps();
    p.type = "zero";
    const result = mount(<CalibrationRow {...p} />);
    p.mcuParams.encoder_enabled_x = 0;
    p.mcuParams.encoder_enabled_y = 1;
    p.mcuParams.encoder_enabled_z = 0;
    [0, 1, 2].map(i => result.find("LockableButton").at(i).simulate("click"));
    expect(p.action).toHaveBeenCalledTimes(3);
    ["x", "y", "z"].map(x => expect(p.action).toHaveBeenCalledWith(x));
  });

  it("is disabled", () => {
    const p = fakeProps();
    p.botOnline = true;
    p.mcuParams.encoder_enabled_x = 1;
    p.mcuParams.encoder_enabled_y = 1;
    p.mcuParams.encoder_enabled_z = 1;
    p.mcuParams.movement_enable_endpoints_x = 1;
    p.mcuParams.movement_enable_endpoints_y = 1;
    p.mcuParams.movement_enable_endpoints_z = 0;
    p.stallUseDisabled = true;
    const result = mount(<CalibrationRow {...p} />);
    [0, 1].map(i =>
      expect(result.find("LockableButton").at(i).props().disabled).toEqual(false));
    expect(result.find("LockableButton").at(2).props().disabled).toEqual(true);
  });
});
