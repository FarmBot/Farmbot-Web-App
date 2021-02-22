jest.mock("../../../devices/actions", () => ({ settingToggle: jest.fn() }));

import React from "react";
import { mount, shallow } from "enzyme";
import { BooleanMCUInputGroup } from "../boolean_mcu_input_group";
import { ToggleButton } from "../../../ui";
import { settingToggle } from "../../../devices/actions";
import { bot } from "../../../__test_support__/fake_state/bot";
import { BooleanMCUInputGroupProps } from "../interfaces";
import { DeviceSetting } from "../../../constants";

describe("BooleanMCUInputGroup", () => {
  const fakeProps = (): BooleanMCUInputGroupProps => ({
    sourceFwConfig: x => ({ value: bot.hardware.mcu_params[x], consistent: true }),
    firmwareHardware: undefined,
    dispatch: jest.fn(),
    tooltip: "Tooltip",
    label: DeviceSetting.invertEncoders,
    x: "encoder_invert_x",
    y: "encoder_invert_y",
    z: "encoder_invert_z",
  });

  enum Buttons { xAxis, yAxis, zAxis }

  it("triggers callbacks", () => {
    const wrapper = mount(<BooleanMCUInputGroup {...fakeProps()} />);
    const xAxisButton = wrapper.find(ToggleButton).at(Buttons.xAxis);
    const yAxisButton = wrapper.find(ToggleButton).at(Buttons.yAxis);
    const zAxisButton = wrapper.find(ToggleButton).at(Buttons.zAxis);
    xAxisButton.simulate("click");
    expect(settingToggle).toHaveBeenLastCalledWith("encoder_invert_x",
      expect.any(Function), undefined);
    yAxisButton.simulate("click");
    expect(settingToggle).toHaveBeenLastCalledWith("encoder_invert_y",
      expect.any(Function), undefined);
    zAxisButton.simulate("click");
    expect(settingToggle).toHaveBeenLastCalledWith("encoder_invert_z",
      expect.any(Function), undefined);
  });

  it("displays gray toggles", () => {
    const p = fakeProps();
    p.grayscale = { x: true, y: false, z: false };
    const wrapper = mount(<BooleanMCUInputGroup {...p} />);
    const xAxisButton = wrapper.find(ToggleButton).at(Buttons.xAxis);
    expect(xAxisButton.props().grayscale).toBeTruthy();
    const yAxisButton = wrapper.find(ToggleButton).at(Buttons.yAxis);
    expect(yAxisButton.props().grayscale).toBeFalsy();
  });

  it("disables toggles", () => {
    const p = fakeProps();
    p.disable = { x: false, y: false, z: false };
    p.disabled = true;
    const wrapper = mount(<BooleanMCUInputGroup {...p} />);
    [0, 1, 2].map(button =>
      expect(wrapper.find(ToggleButton).at(button).props().disabled)
        .toEqual(true));
  });

  it("disables axis toggles", () => {
    const p = fakeProps();
    p.disable = { x: true, y: true, z: true };
    p.disabled = false;
    const wrapper = mount(<BooleanMCUInputGroup {...p} />);
    [0, 1, 2].map(button =>
      expect(wrapper.find(ToggleButton).at(button).props().disabled)
        .toEqual(true));
  });

  it("overrides advanced hide", () => {
    const p = fakeProps();
    p.advanced = true;
    p.showAdvanced = false;
    bot.hardware.mcu_params.encoder_invert_x = 0;
    bot.hardware.mcu_params.encoder_invert_y = 0;
    bot.hardware.mcu_params.encoder_invert_z = 1;
    const wrapper = shallow(<BooleanMCUInputGroup {...p} />);
    expect(wrapper.find("Highlight").props().hidden).toEqual(false);
  });
});
