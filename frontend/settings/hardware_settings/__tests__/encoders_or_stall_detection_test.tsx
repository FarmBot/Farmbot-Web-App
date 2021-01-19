import React from "react";
import { mount } from "enzyme";
import { EncodersOrStallDetection } from "../encoders_or_stall_detection";
import { EncodersOrStallDetectionProps } from "../interfaces";
import { panelState } from "../../../__test_support__/control_panel_state";
import { bot } from "../../../__test_support__/fake_state/bot";
import { BooleanMCUInputGroup } from "../boolean_mcu_input_group";

describe("<EncodersOrStallDetection />", () => {
  const fakeProps = (): EncodersOrStallDetectionProps => ({
    dispatch: jest.fn(),
    controlPanelState: panelState(),
    sourceFwConfig: x =>
      ({ value: bot.hardware.mcu_params[x], consistent: true }),
    firmwareHardware: undefined,
    arduinoBusy: false,
  });

  it("shows encoder labels", () => {
    const p = fakeProps();
    p.firmwareHardware = undefined;
    const wrapper = mount(<EncodersOrStallDetection {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("encoder");
    expect(wrapper.text().toLowerCase()).not.toContain("stall");
  });

  it("shows stall labels", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const wrapper = mount(<EncodersOrStallDetection {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("encoder");
    expect(wrapper.text().toLowerCase()).toContain("stall");
  });

  it("doesn't disable encoder toggles", () => {
    const p = fakeProps();
    p.controlPanelState.encoders_or_stall_detection = true;
    p.firmwareHardware = "arduino";
    const wrapper = mount(<EncodersOrStallDetection {...p} />);
    expect(wrapper.find(BooleanMCUInputGroup).first().props().disabled)
      .toEqual(false);
  });

  it("doesn't disable stall detection toggles", () => {
    const p = fakeProps();
    p.controlPanelState.encoders_or_stall_detection = true;
    p.firmwareHardware = "express_k10";
    const wrapper = mount(<EncodersOrStallDetection {...p} />);
    expect(wrapper.find(BooleanMCUInputGroup).first().props().disabled)
      .toEqual(false);
    expect(wrapper.text().toLowerCase()).toContain("sensitivity");
  });
});
