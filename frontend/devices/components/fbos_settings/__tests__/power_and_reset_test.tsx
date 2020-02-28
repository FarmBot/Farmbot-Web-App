const mockDevice = { rebootFirmware: jest.fn(() => Promise.resolve()) };
jest.mock("../../../../device", () => ({ getDevice: () => mockDevice }));

jest.mock("../../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

let mockDev = false;
jest.mock("../../../../account/dev/dev_support", () => ({
  DevSettings: {
    futureFeaturesEnabled: () => mockDev,
  }
}));

import * as React from "react";
import { PowerAndReset } from "../power_and_reset";
import { mount } from "enzyme";
import { PowerAndResetProps } from "../interfaces";
import { bot } from "../../../../__test_support__/fake_state/bot";
import { panelState } from "../../../../__test_support__/control_panel_state";
import { fakeState } from "../../../../__test_support__/fake_state";
import { clickButton } from "../../../../__test_support__/helpers";
import { fakeFbosConfig } from "../../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../../__test_support__/resource_index_builder";
import { edit, save } from "../../../../api/crud";

describe("<PowerAndReset/>", () => {
  beforeEach(() => {
    mockDev = false;
  });

  const fakeConfig = fakeFbosConfig();
  const state = fakeState();
  state.resources = buildResourceIndex([fakeConfig]);

  const fakeProps = (): PowerAndResetProps => ({
    controlPanelState: panelState(),
    dispatch: jest.fn(x => x(jest.fn(), () => state)),
    sourceFbosConfig: () => ({ value: true, consistent: true }),
    botOnline: true,
  });

  it("renders in open state", () => {
    const p = fakeProps();
    p.controlPanelState.power_and_reset = true;
    const wrapper = mount(<PowerAndReset {...p} />);
    ["Power and Reset", "Restart", "Shutdown",
      "Factory Reset", "Automatic Factory Reset",
      "Connection Attempt Period", "Change Ownership"]
      .map(string => expect(wrapper.text().toLowerCase())
        .toContain(string.toLowerCase()));
    expect(wrapper.text().toLowerCase())
      .toContain("Restart Firmware".toLowerCase());
  });

  it("doesn't render restart firmware", () => {
    mockDev = true;
    const p = fakeProps();
    p.controlPanelState.power_and_reset = true;
    const wrapper = mount(<PowerAndReset {...p} />);
    expect(wrapper.text().toLowerCase())
      .not.toContain("Restart Firmware".toLowerCase());
  });

  it("renders as closed", () => {
    const p = fakeProps();
    p.controlPanelState.power_and_reset = false;
    const wrapper = mount(<PowerAndReset {...p} />);
    expect(wrapper.text().toLowerCase())
      .toContain("Power and Reset".toLowerCase());
    expect(wrapper.text().toLowerCase())
      .not.toContain("Factory Reset".toLowerCase());
  });

  it("timer input disabled", () => {
    bot.hardware.configuration.disable_factory_reset = true;
    const p = fakeProps();
    p.controlPanelState.power_and_reset = true;
    const wrapper = mount(<PowerAndReset {...p} />);
    expect(wrapper.find("input").last().props().disabled).toBeTruthy();
    expect(wrapper.find("label").last().props().style)
      .toEqual({ color: "grey" });
  });

  it("toggles auto reset", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: false, consistent: true });
    p.controlPanelState.power_and_reset = true;
    const wrapper = mount(<PowerAndReset {...p} />);
    clickButton(wrapper, 4, "yes");
    expect(edit).toHaveBeenCalledWith(fakeConfig, { disable_factory_reset: true });
    expect(save).toHaveBeenCalledWith(fakeConfig.uuid);
  });

  it("restarts firmware", () => {
    const p = fakeProps();
    p.controlPanelState.power_and_reset = true;
    const wrapper = mount(<PowerAndReset {...p} />);
    expect(wrapper.text().toLowerCase())
      .toContain("Restart Firmware".toLowerCase());
    clickButton(wrapper, 2, "restart");
    expect(mockDevice.rebootFirmware).toHaveBeenCalled();
  });

  it("shows change ownership button", () => {
    const p = fakeProps();
    p.controlPanelState.power_and_reset = true;
    const wrapper = mount(<PowerAndReset {...p} />);
    expect(wrapper.text().toLowerCase())
      .toContain("Change Ownership".toLowerCase());
  });
});
