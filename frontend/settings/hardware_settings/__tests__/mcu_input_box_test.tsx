jest.mock("../../../devices/actions", () => ({ updateMCU: jest.fn() }));

import React from "react";
import { McuInputBox } from "../mcu_input_box";
import { shallow, mount } from "enzyme";
import { McuInputBoxProps } from "../interfaces";
import { bot } from "../../../__test_support__/fake_state/bot";
import { updateMCU } from "../../../devices/actions";
import { warning } from "../../../toast/toast";
import { SettingStatusIndicator } from "../setting_status_indicator";
import { BlurableInput } from "../../../ui";

describe("McuInputBox", () => {
  const fakeProps = (): McuInputBoxProps => ({
    sourceFwConfig: x =>
      ({ value: bot.hardware.mcu_params[x], consistent: true }),
    firmwareHardware: undefined,
    setting: "encoder_enabled_x",
    dispatch: jest.fn()
  });

  it("renders inconsistency", () => {
    const p = fakeProps();
    p.sourceFwConfig = x =>
      ({ value: bot.hardware.mcu_params[x], consistent: false });
    const wrapper = shallow(<McuInputBox {...p} />);
    expect(wrapper.find(SettingStatusIndicator).props().isSyncing).toBeTruthy();
  });

  it("clamps negative numbers", () => {
    const mib = new McuInputBox(fakeProps());
    const result = mib.clampInputAndWarn("-1", "short");
    expect(result).toEqual(0);
    expect(warning)
      .toHaveBeenCalledWith("Minimum input is 0. Rounding up.");
  });

  it("clamps large numbers", () => {
    const mib = new McuInputBox(fakeProps());
    const result = mib.clampInputAndWarn("100000", "short");
    expect(result).toEqual(32000);
    expect(warning)
      .toHaveBeenCalledWith("Maximum input is 32,000. Rounding down.");
  });

  it("handles bad input", () => {
    const mib = new McuInputBox(fakeProps());
    expect(() => mib.clampInputAndWarn("QQQ", "short"))
      .toThrow("Bad input in mcu_input_box. Impossible?");
    expect(warning)
      .toHaveBeenCalledWith("Please enter a number between 0 and 32,000");
  });

  it("handles float", () => {
    const p = fakeProps();
    p.float = true;
    const wrapper = shallow(<McuInputBox {...p} />);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: "5.5" } });
    expect(updateMCU).toHaveBeenCalledWith("encoder_enabled_x", "5.5");
  });

  it("handles int", () => {
    const p = fakeProps();
    p.float = false;
    const wrapper = shallow(<McuInputBox {...p} />);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: "5.5" } });
    expect(updateMCU).toHaveBeenCalledWith("encoder_enabled_x", "5");
  });

  it("scales values", () => {
    const p = fakeProps();
    p.scale = 10;
    bot.hardware.mcu_params.encoder_enabled_x = 7;
    const wrapper = shallow(<McuInputBox {...p} />);
    expect(wrapper.find(BlurableInput).props().value).toEqual("0.7");
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: "5.5" } });
    expect(updateMCU).toHaveBeenCalledWith("encoder_enabled_x", "55");
  });

  it("doesn't update when values match", () => {
    const p = fakeProps();
    bot.hardware.mcu_params.encoder_enabled_x = 1;
    const wrapper = shallow(<McuInputBox {...p} />);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: "1" } });
    expect(updateMCU).not.toHaveBeenCalled();
  });

  it("restricts values to min and max", () => {
    const p = fakeProps();
    p.min = -10;
    p.max = 10;
    const wrapper = mount(<McuInputBox {...p} />);
    const input = wrapper.find("input");
    expect(input.props().min).toEqual(-10);
    expect(input.props().max).toEqual(10);
    expect(wrapper.find(".error").length).toEqual(0);
  });

  it("shows warning", () => {
    const p = fakeProps();
    p.warnMin = 10;
    bot.hardware.mcu_params.encoder_enabled_x = 7;
    const wrapper = mount(<McuInputBox {...p} />);
    expect(wrapper.find(".error").length).toEqual(1);
  });

  it("updates status", () => {
    jest.useFakeTimers();
    const p = fakeProps();
    p.sourceFwConfig = () => ({ value: 1, consistent: false });
    const wrapper = mount<McuInputBox>(<McuInputBox {...p} />);
    wrapper.instance().componentDidUpdate();
    expect(wrapper.state().syncing).toEqual(true);
    jest.runAllTimers();
    expect(wrapper.state().syncing).toEqual(false);
    wrapper.setState({ inconsistent: false });
    wrapper.instance().componentDidUpdate();
  });
});
