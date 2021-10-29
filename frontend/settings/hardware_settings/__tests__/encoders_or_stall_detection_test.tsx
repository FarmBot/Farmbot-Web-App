let mockDev = false;
jest.mock("../../dev/dev_support", () => ({
  DevSettings: { futureFeaturesEnabled: () => mockDev }
}));

import React from "react";
import { mount } from "enzyme";
import { EncodersOrStallDetection } from "../encoders_or_stall_detection";
import { EncodersOrStallDetectionProps } from "../interfaces";
import { settingsPanelState } from "../../../__test_support__/panel_state";
import { bot } from "../../../__test_support__/fake_state/bot";
import { BooleanMCUInputGroup } from "../boolean_mcu_input_group";

describe("<EncodersOrStallDetection />", () => {
  const fakeProps = (): EncodersOrStallDetectionProps => ({
    dispatch: jest.fn(),
    settingsPanelState: settingsPanelState(),
    sourceFwConfig: x =>
      ({ value: bot.hardware.mcu_params[x], consistent: true }),
    firmwareHardware: undefined,
    arduinoBusy: false,
    showAdvanced: true,
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
    p.settingsPanelState.encoders_or_stall_detection = true;
    p.firmwareHardware = "arduino";
    const wrapper = mount(<EncodersOrStallDetection {...p} />);
    expect(wrapper.find(BooleanMCUInputGroup).first().props().disabled)
      .toEqual(false);
  });

  it("doesn't disable stall detection toggles", () => {
    const p = fakeProps();
    p.settingsPanelState.encoders_or_stall_detection = true;
    p.firmwareHardware = "express_k10";
    const wrapper = mount(<EncodersOrStallDetection {...p} />);
    expect(wrapper.find(BooleanMCUInputGroup).first().props().disabled)
      .toEqual(false);
  });

  it("shows sensitivity setting", () => {
    mockDev = true;
    const p = fakeProps();
    p.settingsPanelState.encoders_or_stall_detection = true;
    p.firmwareHardware = "express_k10";
    const wrapper = mount(<EncodersOrStallDetection {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("sensitivity");
  });
});
