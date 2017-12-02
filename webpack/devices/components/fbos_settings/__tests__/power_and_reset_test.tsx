const mockDevice = {
  updateConfig: jest.fn(() => { return Promise.resolve(); }),
};
jest.mock("../../../../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { PowerAndReset } from "../power_and_reset";
import { mount } from "enzyme";
import { bot } from "../../../../__test_support__/fake_state/bot";

describe("<PowerAndReset/>", () => {
  it("open", () => {
    bot.controlPanelState.power_and_reset = true;
    const wrapper = mount(<PowerAndReset bot={bot} dispatch={jest.fn()} />);
    ["Power and Reset", "Restart", "Shutdown", "Factory Reset",
      "Automatic Factory Reset", "Connection Attempt Period"]
      .map(string => expect(wrapper.text().toLowerCase())
        .toContain(string.toLowerCase()));
  });

  it("closed", () => {
    bot.controlPanelState.power_and_reset = false;
    const wrapper = mount(<PowerAndReset bot={bot} dispatch={jest.fn()} />);
    expect(wrapper.text().toLowerCase())
      .toContain("Power and Reset".toLowerCase());
    expect(wrapper.text().toLowerCase())
      .not.toContain("Factory Reset".toLowerCase());
  });

  it("timer input disabled", () => {
    bot.controlPanelState.power_and_reset = true;
    bot.hardware.configuration.disable_factory_reset = true;
    const wrapper = mount(<PowerAndReset bot={bot} dispatch={jest.fn()} />);
    expect(wrapper.find("input").last().props().disabled).toBeTruthy();
    expect(wrapper.find("label").last().props().style)
      .toEqual({ color: "grey" });
  });

  it("toggles auto reset", () => {
    bot.controlPanelState.power_and_reset = true;
    bot.hardware.configuration.disable_factory_reset = false;
    const wrapper = mount(<PowerAndReset bot={bot} dispatch={jest.fn()} />);
    wrapper.find("button").at(3).simulate("click");
    expect(mockDevice.updateConfig)
      .toHaveBeenCalledWith({ disable_factory_reset: true });
  });
});
