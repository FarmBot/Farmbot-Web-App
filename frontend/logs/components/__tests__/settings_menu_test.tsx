jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

const mockStorj: Dictionary<number | boolean> = {};

let mockDev = false;
jest.mock("../../../settings/dev/dev_support", () => ({
  DevSettings: { futureFeaturesEnabled: () => mockDev }
}));

import * as React from "react";
import { mount } from "enzyme";
import { LogsSettingsMenu } from "../settings_menu";
import { ConfigurationName, Dictionary } from "farmbot";
import { NumericSetting } from "../../../session_keys";
import { LogsSettingsMenuProps } from "../../interfaces";
import { fakeState } from "../../../__test_support__/fake_state";
import { fakeFbosConfig } from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { edit, save } from "../../../api/crud";
import { bot } from "../../../__test_support__/fake_state/bot";

describe("<LogsSettingsMenu />", () => {
  const fakeConfig = fakeFbosConfig();
  const state = fakeState();
  state.resources = buildResourceIndex([fakeConfig]);

  const fakeProps = (): LogsSettingsMenuProps => ({
    setFilterLevel: () => jest.fn(),
    dispatch: jest.fn(x => x(jest.fn(), () => state)),
    sourceFbosConfig: () => ({ value: false, consistent: true }),
    getConfigValue: x => mockStorj[x],
    bot: bot,
  });

  it("renders", () => {
    const wrapper = mount(<LogsSettingsMenu {...fakeProps()} />);
    ["begin", "steps", "complete"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
    expect(wrapper.find("a").length).toEqual(0);
  });

  it("doesn't update", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: false, consistent: true });
    const wrapper = mount<LogsSettingsMenu>(<LogsSettingsMenu {...p} />);
    expect(wrapper.instance().shouldComponentUpdate(p)).toBeFalsy();
  });

  it("updates", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: true, consistent: true });
    const wrapper = mount<LogsSettingsMenu>(<LogsSettingsMenu {...p} />);
    expect(wrapper.instance().shouldComponentUpdate(fakeProps())).toBeTruthy();
  });

  function testSettingToggle(setting: ConfigurationName, position: number) {
    it("toggles setting", () => {
      const p = fakeProps();
      p.sourceFbosConfig = () => ({ value: false, consistent: true });
      const wrapper = mount(<LogsSettingsMenu {...p} />);
      wrapper.find("button").at(position).simulate("click");
      expect(edit).toHaveBeenCalledWith(fakeConfig, { [setting]: true });
      expect(save).toHaveBeenCalledWith(fakeConfig.uuid);
    });
  }
  testSettingToggle("sequence_init_log", 0);
  testSettingToggle("sequence_body_log", 1);
  testSettingToggle("sequence_complete_log", 2);
  testSettingToggle("firmware_output_log", 3);
  testSettingToggle("firmware_input_log", 4);
  testSettingToggle("arduino_debug_messages", 5);

  it("conditionally increases filter level", () => {
    const p = fakeProps();
    const setFilterLevel = jest.fn();
    p.setFilterLevel = () => setFilterLevel;
    const wrapper = mount(<LogsSettingsMenu {...p} />);
    mockStorj[NumericSetting.busy_log] = 0;
    wrapper.find("button").at(0).simulate("click");
    expect(setFilterLevel).toHaveBeenCalledWith(2);
    jest.clearAllMocks();
    mockStorj[NumericSetting.busy_log] = 3;
    wrapper.find("button").at(0).simulate("click");
    expect(setFilterLevel).not.toHaveBeenCalled();
  });

  it("doesn't change filter levels", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: true, consistent: true });
    const setFilterLevel = jest.fn();
    p.setFilterLevel = () => setFilterLevel;
    const wrapper = mount(<LogsSettingsMenu {...p} />);
    mockStorj[NumericSetting.busy_log] = 0;
    wrapper.find("button").at(0).simulate("click");
    expect(setFilterLevel).not.toHaveBeenCalled();
  });

  it("displays link to /logger", () => {
    mockDev = true;
    const p = fakeProps();
    p.bot.hardware.informational_settings.private_ip = "10.0.0.1";
    const wrapper = mount(<LogsSettingsMenu {...p} />);
    expect(wrapper.find("a").last().props().href)
      .toEqual("http://10.0.0.1/logger");
  });
});
