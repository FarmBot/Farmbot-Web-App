import React from "react";
import { mount, shallow } from "enzyme";
import { NumericMCUInputGroup } from "../numeric_mcu_input_group";
import { NumericMCUInputGroupProps } from "../interfaces";
import { DeviceSetting } from "../../../constants";
import { bot } from "../../../__test_support__/fake_state/bot";

describe("<NumericMCUInputGroup />", () => {
  const fakeProps = (): NumericMCUInputGroupProps => ({
    sourceFwConfig: x => ({ value: bot.hardware.mcu_params[x], consistent: true }),
    firmwareHardware: undefined,
    dispatch: jest.fn(),
    tooltip: "tip",
    label: DeviceSetting.motors,
    x: "encoder_enabled_x",
    y: "encoder_enabled_y",
    z: "encoder_enabled_z",
  });

  it("renders", () => {
    const wrapper = mount(<NumericMCUInputGroup {...fakeProps()} />);
    expect(wrapper.text()).toContain(DeviceSetting.motors);
    expect(wrapper.find(".error").length).toEqual(0);
  });

  it("overrides advanced hide", () => {
    const p = fakeProps();
    p.advanced = true;
    p.showAdvanced = false;
    bot.hardware.mcu_params.encoder_enabled_x = 1;
    bot.hardware.mcu_params.encoder_enabled_y = 1;
    bot.hardware.mcu_params.encoder_enabled_z = 0;
    const wrapper = shallow(<NumericMCUInputGroup {...p} />);
    expect(wrapper.find("Highlight").props().hidden).toEqual(false);
  });

  it("shows limit warnings", () => {
    const p = fakeProps();
    bot.hardware.mcu_params.encoder_enabled_x = 1;
    bot.hardware.mcu_params.encoder_enabled_y = 1;
    bot.hardware.mcu_params.encoder_enabled_z = 0;
    p.warnMin = { x: 2, y: 2, z: 0 };
    const wrapper = mount(<NumericMCUInputGroup {...p} />);
    expect(wrapper.find(".error").length).toEqual(2);
  });

  it("shows other warnings", () => {
    const p = fakeProps();
    bot.hardware.mcu_params.encoder_enabled_x = 1;
    bot.hardware.mcu_params.encoder_enabled_y = 1;
    bot.hardware.mcu_params.encoder_enabled_z = 1;
    p.advanced = true;
    p.showAdvanced = false;
    p.warning = { x: undefined, y: undefined, z: "error" };
    const wrapper = mount(<NumericMCUInputGroup {...p} />);
    expect(wrapper.find(".error").length).toEqual(1);
  });

  it("handles undefined values", () => {
    const p = fakeProps();
    p.x = "movement_step_per_mm_x";
    p.sourceFwConfig = () => ({ value: undefined, consistent: true });
    p.xScale = undefined;
    p.advanced = true;
    p.showAdvanced = false;
    const wrapper = shallow(<NumericMCUInputGroup {...p} />);
    expect(wrapper.find("Highlight").props().hidden).toEqual(false);
  });
});
