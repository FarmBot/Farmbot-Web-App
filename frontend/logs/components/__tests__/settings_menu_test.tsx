const mockStorj: Dictionary<number | boolean> = {};

let mockDev = false;

import React from "react";
import { fireEvent, render } from "@testing-library/react";
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
    const { container } = render(<LogsSettingsMenu {...fakeProps()} />);
    ["begin", "steps", "complete"].map(string =>
      expect(container.textContent?.toLowerCase()).toContain(string));
    expect(container.querySelectorAll("a").length).toEqual(0);
    expect(container.textContent?.toLowerCase()).not.toContain("firmware");
  });

  it("doesn't update", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: false, consistent: true });
    const instance = new LogsSettingsMenu(p);
    expect(instance.shouldComponentUpdate(p)).toBeFalsy();
  });

  it("updates", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: true, consistent: true });
    const instance = new LogsSettingsMenu(p);
    expect(instance.shouldComponentUpdate(fakeProps())).toBeTruthy();
  });

  it("deletes all logs", async () => {
    Object.defineProperty(window.location, "assign", {
      configurable: true,
      value: jest.fn(),
    });
    const p = fakeProps();
    p.dispatch = jest.fn();
    const { container } = render(<LogsSettingsMenu {...p} />);
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[buttons.length - 1]);
    await Promise.resolve();
    await Promise.resolve();
    expect(crud.destroyAll).toHaveBeenCalledWith(
      "Log", false, Content.DELETE_ALL_LOGS_CONFIRMATION);
    expect(p.dispatch).not.toHaveBeenCalled();
    expect(window.location.assign).toHaveBeenCalled();
  });

  function testSettingToggle(setting: ConfigurationName, position: number) {
    it(`toggles ${setting} setting`, () => {
      const p = fakeProps();
      p.sourceFbosConfig = () => ({ value: false, consistent: true });
      const { container } = render(<LogsSettingsMenu {...p} />);
      const buttons = container
        .querySelectorAll("fieldset.row.half-gap.grid-exp-2 button");
      fireEvent.click(buttons[position - 1]);
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
    const { container } = render(<LogsSettingsMenu {...p} />);
    mockStorj[NumericSetting.busy_log] = 0;
    const buttons = container
      .querySelectorAll("fieldset.row.half-gap.grid-exp-2 button");
    fireEvent.click(buttons[0]);
    expect(setFilterLevel).toHaveBeenCalledWith(2);
    jest.clearAllMocks();
    mockStorj[NumericSetting.busy_log] = 3;
    fireEvent.click(buttons[0]);
    expect(setFilterLevel).not.toHaveBeenCalled();
  });

  it("doesn't change filter levels", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: true, consistent: true });
    const setFilterLevel = jest.fn();
    p.setFilterLevel = () => setFilterLevel;
    const { container } = render(<LogsSettingsMenu {...p} />);
    mockStorj[NumericSetting.busy_log] = 0;
    const buttons = container
      .querySelectorAll("fieldset.row.half-gap.grid-exp-2 button");
    fireEvent.click(buttons[0]);
    expect(setFilterLevel).not.toHaveBeenCalled();
  });

  it("displays link to /logger", () => {
    mockDev = true;
    const p = fakeProps();
    p.bot.hardware.informational_settings.private_ip = "10.0.0.1";
    const { container } = render(<LogsSettingsMenu {...p} />);
    const links = container.querySelectorAll("a");
    expect((links[links.length - 1]).href)
      .toEqual("http://10.0.0.1/logger");
  });
});
