import React from "react";
import { mount } from "enzyme";
import { NumericMCUInputGroup } from "../numeric_mcu_input_group";
import { NumericMCUInputGroupProps } from "../interfaces";
import { DeviceSetting } from "../../../constants";

describe("<NumericMCUInputGroup />", () => {
  const fakeProps = (): NumericMCUInputGroupProps => ({
    sourceFwConfig: () => ({ value: 0, consistent: true }),
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
});
