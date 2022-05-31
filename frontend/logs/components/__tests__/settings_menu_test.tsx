jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
  destroyAll: jest.fn(() => Promise.resolve()),
}));

const mockStorj: Dictionary<number | boolean> = {};

let mockDev = false;
jest.mock("../../../settings/dev/dev_support", () => ({
  DevSettings: { futureFeaturesEnabled: () => mockDev }
}));

import React from "react";
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
import { destroyAll, edit, save } from "../../../api/crud";
import { bot } from "../../../__test_support__/fake_state/bot";
import { Content } from "../../../constants";

describe("<LogsSettingsMenu />", () => {
  beforeEach(() => { mockDev = false; });

  const fakeConfig = fakeFbosConfig();
  const state = fakeState();
  state.resources = buildResourceIndex([fakeConfig]);

  const fakeProps = (): LogsSettingsMenuProps => ({
    setFilterLevel: () => jest.fn(),
    dispatch: jest.fn(x => x?.(jest.fn(), () => state)),
    sourceFbosConfig: () => ({ value: false, consistent: true }),
    getConfigValue: x => mockStorj[x],
    bot: bot,
    markdown: true,
    toggleMarkdown: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<LogsSettingsMenu {...fakeProps()} />);
    ["begin", "steps", "complete"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
    expect(wrapper.find("a").length).toEqual(0);
    expect(wrapper.text().toLowerCase()).not.toContain("firmware");
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

  it("deletes all logs", async () => {
    location.assign = jest.fn();
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.resolve());
    const wrapper = mount<LogsSettingsMenu>(<LogsSettingsMenu {...p} />);
    await wrapper.find("button").last().simulate("click");
    expect(destroyAll).toHaveBeenCalledWith(
      "Log", false, Content.DELETE_ALL_LOGS_CONFIRMATION);
    expect(location.assign).toHaveBeenCalled();
  });

  function testSettingToggle(setting: ConfigurationName, position: number) {
    it(`toggles ${setting} setting`, () => {
      const p = fakeProps();
      p.sourceFbosConfig = () => ({ value: false, consistent: true });
      const wrapper = mount(<LogsSettingsMenu {...p} />);
      wrapper.find("button").at(position).simulate("click");
      expect(edit).toHaveBeenCalledWith(fakeConfig, { [setting]: true });
      expect(save).toHaveBeenCalledWith(fakeConfig.uuid);
    });
  }
  testSettingToggle("sequence_init_log", 1);
  testSettingToggle("sequence_body_log", 2);
  testSettingToggle("sequence_complete_log", 3);

  it("conditionally increases filter level", () => {
    const p = fakeProps();
    const setFilterLevel = jest.fn();
    p.setFilterLevel = () => setFilterLevel;
    const wrapper = mount(<LogsSettingsMenu {...p} />);
    mockStorj[NumericSetting.busy_log] = 0;
    wrapper.find("button").at(1).simulate("click");
    expect(setFilterLevel).toHaveBeenCalledWith(2);
    jest.clearAllMocks();
    mockStorj[NumericSetting.busy_log] = 3;
    wrapper.find("button").at(1).simulate("click");
    expect(setFilterLevel).not.toHaveBeenCalled();
  });

  it("doesn't change filter levels", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: true, consistent: true });
    const setFilterLevel = jest.fn();
    p.setFilterLevel = () => setFilterLevel;
    const wrapper = mount(<LogsSettingsMenu {...p} />);
    mockStorj[NumericSetting.busy_log] = 0;
    wrapper.find("button").at(1).simulate("click");
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
