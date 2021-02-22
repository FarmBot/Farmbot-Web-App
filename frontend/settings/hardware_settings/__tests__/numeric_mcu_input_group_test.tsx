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
});
