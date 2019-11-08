jest.mock("../../actions", () => ({ settingToggle: jest.fn() }));

import * as React from "react";
import { mount } from "enzyme";
import { BooleanMCUInputGroup } from "../boolean_mcu_input_group";
import { ToggleButton } from "../../../controls/toggle_button";
import { settingToggle } from "../../actions";
import { bot } from "../../../__test_support__/fake_state/bot";
import { BooleanMCUInputGroupProps } from "../interfaces";

describe("BooleanMCUInputGroup", () => {
  const fakeProps = (): BooleanMCUInputGroupProps => ({
    sourceFwConfig: x => ({ value: bot.hardware.mcu_params[x], consistent: true }),
    dispatch: jest.fn(),
    tooltip: "Tooltip",
    name: "Name",
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
});
