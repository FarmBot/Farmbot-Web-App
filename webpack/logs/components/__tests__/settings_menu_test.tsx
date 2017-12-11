const mockDevice = {
  updateConfig: jest.fn(() => { return Promise.resolve(); }),
};
jest.mock("../../../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { mount } from "enzyme";
import { LogsSettingsMenu } from "../settings_menu";
import { bot } from "../../../__test_support__/fake_state/bot";
import { ConfigurationName } from "farmbot";

describe("<LogsSettingsMenu />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders", () => {
    const wrapper = mount(<LogsSettingsMenu
      bot={bot} setFilterLevel={() => jest.fn()} />);
    ["begin", "steps", "complete"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });

  function testSettingToggle(setting: ConfigurationName, position: number) {
    it("toggles setting", () => {
      bot.hardware.configuration[setting] = false;
      const wrapper = mount(<LogsSettingsMenu
        bot={bot} setFilterLevel={() => jest.fn()} />);
      wrapper.find("button").at(position).simulate("click");
      expect(mockDevice.updateConfig)
        .toHaveBeenCalledWith({ [setting]: true });
    });
  }
  testSettingToggle("sequence_init_log", 0);
  testSettingToggle("sequence_body_log", 1);
  testSettingToggle("sequence_complete_log", 2);
  testSettingToggle("firmware_output_log", 3);
  testSettingToggle("firmware_input_log", 4);
});
