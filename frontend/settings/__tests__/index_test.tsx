let mockHighlightName = "";

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { RawDesignerSettings as DesignerSettings } from "../index";
import { DesignerSettingsProps } from "../interfaces";
import { BooleanSetting, NumericSetting } from "../../session_keys";
import * as configStorageActions from "../../config_storage/actions";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { bot } from "../../__test_support__/fake_state/bot";
import { Actions } from "../../constants";
import * as hardwareSettings from "../hardware_settings";
import * as maybeHighlight from "../maybe_highlight";
import { SettingsPanelState } from "../../interfaces";
import { settingsPanelState } from "../../__test_support__/panel_state";
import {
  fakeFbosConfig,
  fakeUser, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { API } from "../../api";
import { FbosConfig } from "farmbot/dist/resources/configs/fbos";
import { Path } from "../../internal_urls";
import * as bootSequenceSelector from "../fbos_settings/boot_sequence_selector";

const EMPTY_RESOURCE_INDEX = buildResourceIndex([]).index;

const getSetting =
  (container: HTMLElement, position: number, containsString: string) => {
    const setting = container.querySelectorAll(".designer-setting")[position] as HTMLElement;
    expect(setting.textContent?.toLowerCase())
      .toContain(containsString.toLowerCase());
    return setting;
  };

describe("<DesignerSettings />", () => {
  let maybeOpenPanelSpy: jest.SpyInstance;
  let _getHighlightNameSpy: jest.SpyInstance;
  let setWebAppConfigValueSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(bootSequenceSelector, "BootSequenceSelector")
      .mockImplementation(() => <div />);
    maybeOpenPanelSpy = jest.spyOn(maybeHighlight, "maybeOpenPanel")
      .mockImplementation(() => jest.fn());
    _getHighlightNameSpy = jest.spyOn(maybeHighlight, "getHighlightName")
      .mockImplementation(() => mockHighlightName);
    setWebAppConfigValueSpy = jest.spyOn(configStorageActions, "setWebAppConfigValue")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    mockHighlightName = "";
  });

  const fakePanelState = settingsPanelState();
  Object.keys(fakePanelState).map((key: keyof SettingsPanelState) =>
    fakePanelState[key] = true);

  const fakeProps = (): DesignerSettingsProps => ({
    dispatch: jest.fn(),
    getConfigValue: () => 0,
    firmwareConfig: undefined,
    sourceFwConfig: () => ({ value: 10, consistent: true }),
    sourceFbosConfig: x => ({
      value: fakeFbosConfig().body[x as keyof FbosConfig], consistent: true,
    }),
    resources: EMPTY_RESOURCE_INDEX,
    deviceAccount: fakeDevice(),
    alerts: [],
    saveFarmwareEnv: jest.fn(),
    timeSettings: fakeTimeSettings(),
    bot: bot,
    searchTerm: "",
    user: fakeUser(),
    farmwareEnvs: [],
    wizardStepResults: [],
    settingsPanelState: fakePanelState,
    distanceIndicator: "",
  });

  it("renders settings", () => {
    const { container } = render(<DesignerSettings {...fakeProps()} />);
    expect(container.textContent).toContain("size");
    expect(container.textContent?.toLowerCase()).toContain("pin");
    const settings = container.querySelectorAll(".designer-setting");
    expect(settings.length).toBeGreaterThanOrEqual(8);
    expect(container.textContent?.toLowerCase()).not.toContain("unstable fe");
    expect(container.textContent?.toLowerCase()).not.toContain("reporting");
    expect(container.textContent?.toLowerCase()).toContain("version");
  });

  it("renders all settings", () => {
    mockHighlightName = "pin_reporting";
    const p = fakeProps();
    p.searchTerm = "pin reporting";
    const { container } = render(<DesignerSettings {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("reporting");
  });

  it("mounts", () => {
    render(<DesignerSettings {...fakeProps()} />);
    expect(maybeOpenPanelSpy).toHaveBeenCalled();
  });

  it("sets search term", () => {
    location.search = "?search=search";
    const p = fakeProps();
    render(<DesignerSettings {...p} />);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SETTINGS_SEARCH_TERM,
      payload: "search",
    });
  });

  it("changes search term", () => {
    location.search = "?search=search";
    location.pathname = "path";
    const p = fakeProps();
    const { container } = render(<DesignerSettings {...p} />);
    const input = container.querySelector("input[name='settingsSearchTerm']");
    if (!input) { throw new Error("Expected settings search input"); }
    fireEvent.change(input, { target: { value: "setting" } });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.BULK_TOGGLE_SETTINGS_PANEL,
      payload: true,
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SETTINGS_SEARCH_TERM,
      payload: "setting",
    });
    expect(mockNavigate).toHaveBeenCalledWith("path");
  });

  it("fetches firmware_hardware", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: "arduino", consistent: true });
    const motorsSpy = jest.spyOn(hardwareSettings, "Motors");
    render(<DesignerSettings {...p} />);
    expect(motorsSpy).toHaveBeenCalled();
    expect(motorsSpy.mock.calls[0]?.[0].firmwareHardware).toEqual("arduino");
  });

  it("expands all", () => {
    const p = fakeProps();
    p.settingsPanelState = settingsPanelState();
    const { container } = render(<DesignerSettings {...p} />);
    const button = container.querySelector("button[title='toggle settings open']");
    if (!button) { throw new Error("Expected toggle-settings button"); }
    fireEvent.click(button);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.BULK_TOGGLE_SETTINGS_PANEL,
      payload: true,
    });
  });

  it("collapses all", () => {
    const p = fakeProps();
    p.settingsPanelState = settingsPanelState();
    p.settingsPanelState.motors = true;
    const { container } = render(<DesignerSettings {...p} />);
    const button = container.querySelector("button[title='toggle settings open']");
    if (!button) { throw new Error("Expected toggle-settings button"); }
    fireEvent.click(button);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.BULK_TOGGLE_SETTINGS_PANEL,
      payload: false,
    });
  });

  it("renders defaultOn setting", () => {
    const p = fakeProps();
    p.settingsPanelState.farm_designer = true;
    const config = fakeWebAppConfig();
    config.body.confirm_plant_deletion = undefined as never;
    p.getConfigValue = key => config.body[key];
    const { container } = render(<DesignerSettings {...p} />);
    const confirmDeletion = getSetting(container, 12, "confirm plant");
    expect(confirmDeletion.querySelector("button")?.textContent).toEqual("on");
  });

  it("toggles setting", () => {
    const p = fakeProps();
    p.settingsPanelState.farm_designer = true;
    const { container } = render(<DesignerSettings {...p} />);
    const trailSetting = getSetting(container, 1, "trail");
    const button = trailSetting.querySelector("button");
    if (!button) { throw new Error("Expected trail toggle button"); }
    fireEvent.click(button);
    expect(setWebAppConfigValueSpy)
      .toHaveBeenCalledWith(BooleanSetting.display_trail, true);
  });

  it("changes origin", () => {
    const p = fakeProps();
    p.settingsPanelState.farm_designer = true;
    p.getConfigValue = () => 2;
    const { container } = render(<DesignerSettings {...p} />);
    const originSetting = getSetting(container, 6, "origin");
    const quadrants = originSetting.querySelectorAll(".quadrant");
    fireEvent.click(quadrants[quadrants.length - 1]);
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      NumericSetting.bot_origin_quadrant, 4);
  });

  it("renders env editor", () => {
    const p = fakeProps();
    p.searchTerm = "env";
    const { container } = render(<DesignerSettings {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("custom settings");
  });

  it("renders setup settings", () => {
    const p = fakeProps();
    p.searchTerm = "setup";
    const { container } = render(<DesignerSettings {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("setup");
  });

  it("navigates to setup wizard", () => {
    const p = fakeProps();
    const { container } = render(<DesignerSettings {...p} />);
    const gear = container.querySelector(".fa-gear");
    if (!gear) { throw new Error("Expected settings menu gear icon"); }
    fireEvent.click(gear);
    const button = screen.getByRole("button", { name: /setup wizard/i });
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith(Path.setup());
  });

  it("toggles dark mode", () => {
    const p = fakeProps();
    const { container } = render(<DesignerSettings {...p} />);
    const button = container.querySelector(".dark-mode-toggle button");
    if (!button) { throw new Error("Expected dark mode toggle button"); }
    fireEvent.click(button);
    expect(setWebAppConfigValueSpy)
      .toHaveBeenCalledWith(BooleanSetting.dark_mode, true);
  });

  it("renders extra setting", () => {
    const p = fakeProps();
    p.searchTerm = "re-seed";
    const { container } = render(<DesignerSettings {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("re-seed");
  });

  it("renders interpolation settings", () => {
    const p = fakeProps();
    p.searchTerm = "interpolation";
    const { container } = render(<DesignerSettings {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("interpolation");
  });

  it("renders 3D settings", () => {
    const p = fakeProps();
    p.searchTerm = "3d";
    const { container } = render(<DesignerSettings {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("3d");
  });

  it("renders dev settings", () => {
    const p = fakeProps();
    p.searchTerm = "developer";
    const { container } = render(<DesignerSettings {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("unstable fe");
  });

  it("renders surprise", () => {
    location.search = "?only=surprise";
    const p = fakeProps();
    p.searchTerm = "surprise";
    const { container } = render(<DesignerSettings {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("attack");
  });

  it("cancels setting isolation", () => {
    location.search = "?only=setting";
    location.pathname = "path";
    const p = fakeProps();
    p.searchTerm = "";
    render(<DesignerSettings {...p} />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith("path");
  });

  it("renders change ownership form", () => {
    API.setBaseUrl("");
    const p = fakeProps();
    const config = fakeWebAppConfig();
    config.body.show_advanced_settings = true;
    p.getConfigValue = key => config.body[key];
    p.bot.hardware.informational_settings.sync_status = "synced";
    p.bot.connectivity.uptime["bot.mqtt"] = { state: "up", at: 1 };
    const { container } = render(<DesignerSettings {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("change ownership");
  });
});
