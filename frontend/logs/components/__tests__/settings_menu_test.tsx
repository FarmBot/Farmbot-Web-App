const mockStorj: Dictionary<number | boolean> = {};

let mockDev = false;

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
import * as crud from "../../../api/crud";
import { bot } from "../../../__test_support__/fake_state/bot";
import { Content } from "../../../constants";
import { DevSettings } from "../../../settings/dev/dev_support";

let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
let destroyAllSpy: jest.SpyInstance;
let futureFeaturesEnabledSpy: jest.SpyInstance;
let originalAssign: Location["assign"];

describe("<LogsSettingsMenu />", () => {
  beforeEach(() => {
    mockDev = false;
    Object.keys(mockStorj).forEach(key => delete mockStorj[key]);
    editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
    saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
    destroyAllSpy = jest.spyOn(crud, "destroyAll")
      .mockResolvedValue({} as never);
    futureFeaturesEnabledSpy = jest.spyOn(DevSettings, "futureFeaturesEnabled")
      .mockImplementation(() => mockDev);
    originalAssign = window.location.assign;
  });

  afterEach(() => {
    editSpy.mockRestore();
    saveSpy.mockRestore();
    destroyAllSpy.mockRestore();
    futureFeaturesEnabledSpy.mockRestore();
    Object.defineProperty(window.location, "assign", {
      configurable: true,
      value: originalAssign,
    });
    document.body.innerHTML = "";
  });

  const fakeProps = (): LogsSettingsMenuProps => ({
    // Build new mutable fixtures for each test case.
    dispatch: jest.fn(x => x?.(jest.fn(), () => {
      const state = fakeState();
      state.resources = buildResourceIndex([fakeFbosConfig()]);
      return state;
    })),
    setFilterLevel: () => jest.fn(),
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
    Object.defineProperty(window.location, "assign", {
      configurable: true,
      value: jest.fn(),
    });
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.resolve());
    const wrapper = mount<LogsSettingsMenu>(<LogsSettingsMenu {...p} />);
    await wrapper.find("button").last().simulate("click");
    expect(crud.destroyAll).toHaveBeenCalledWith(
      "Log", false, Content.DELETE_ALL_LOGS_CONFIRMATION);
    expect(window.location.assign).toHaveBeenCalled();
  });

  function testSettingToggle(setting: ConfigurationName, position: number) {
    it(`toggles ${setting} setting`, () => {
      const p = fakeProps();
      p.sourceFbosConfig = () => ({ value: false, consistent: true });
      const wrapper = mount(<LogsSettingsMenu {...p} />);
      wrapper.find("fieldset.row.half-gap.grid-exp-2 button")
        .at(position - 1).simulate("click");
      expect(p.dispatch).toHaveBeenCalled();
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
    wrapper.find("fieldset.row.half-gap.grid-exp-2 button")
      .first().simulate("click");
    expect(setFilterLevel).toHaveBeenCalledWith(2);
    jest.clearAllMocks();
    mockStorj[NumericSetting.busy_log] = 3;
    wrapper.find("fieldset.row.half-gap.grid-exp-2 button")
      .first().simulate("click");
    expect(setFilterLevel).not.toHaveBeenCalled();
  });

  it("doesn't change filter levels", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: true, consistent: true });
    const setFilterLevel = jest.fn();
    p.setFilterLevel = () => setFilterLevel;
    const wrapper = mount(<LogsSettingsMenu {...p} />);
    mockStorj[NumericSetting.busy_log] = 0;
    wrapper.find("fieldset.row.half-gap.grid-exp-2 button")
      .first().simulate("click");
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
