let mockHighlightName = "";

jest.mock("../fbos_settings/boot_sequence_selector", () => ({
  BootSequenceSelector: () => <div />,
}));

import React from "react";
import { mount, ReactWrapper, shallow } from "enzyme";
import { RawDesignerSettings as DesignerSettings } from "../index";
import { DesignerSettingsProps } from "../interfaces";
import { BooleanSetting, NumericSetting } from "../../session_keys";
import * as configStorageActions from "../../config_storage/actions";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { bot } from "../../__test_support__/fake_state/bot";
import { clickButton } from "../../__test_support__/helpers";
import { Actions } from "../../constants";
import { Motors } from "../hardware_settings";
import { SearchField } from "../../ui/search_field";
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

const EMPTY_RESOURCE_INDEX = buildResourceIndex([]).index;

const getSetting =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (wrapper: ReactWrapper<any>, position: number, containsString: string) => {
    const setting = wrapper.find(".designer-setting").at(position);
    expect(setting.text().toLowerCase())
      .toContain(containsString.toLowerCase());
    return setting;
  };

afterAll(() => {
  jest.unmock("../fbos_settings/boot_sequence_selector");
});
describe("<DesignerSettings />", () => {
  let maybeOpenPanelSpy: jest.SpyInstance;
  let _getHighlightNameSpy: jest.SpyInstance;
  let setWebAppConfigValueSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    maybeOpenPanelSpy = jest.spyOn(maybeHighlight, "maybeOpenPanel")
      .mockImplementation(() => jest.fn());
    _getHighlightNameSpy = jest.spyOn(maybeHighlight, "getHighlightName")
      .mockImplementation(() => mockHighlightName);
    setWebAppConfigValueSpy = jest.spyOn(configStorageActions, "setWebAppConfigValue")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
    const wrapper = mount(<DesignerSettings {...fakeProps()} />);
    expect(wrapper.text()).toContain("size");
    expect(wrapper.text().toLowerCase()).toContain("pin");
    const settings = wrapper.find(".designer-setting");
    expect(settings.length).toBeGreaterThanOrEqual(8);
    expect(wrapper.text().toLowerCase()).not.toContain("unstable fe");
    expect(wrapper.text().toLowerCase()).not.toContain("reporting");
    expect(wrapper.text().toLowerCase()).toContain("version");
  });

  it("renders all settings", () => {
    mockHighlightName = "pin_reporting";
    const p = fakeProps();
    p.searchTerm = "pin reporting";
    const wrapper = mount(<DesignerSettings {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("reporting");
  });

  it("mounts", () => {
    mount(<DesignerSettings {...fakeProps()} />);
    expect(maybeOpenPanelSpy).toHaveBeenCalled();
  });

  it("sets search term", () => {
    location.search = "?search=search";
    const p = fakeProps();
    mount(<DesignerSettings {...p} />);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SETTINGS_SEARCH_TERM,
      payload: "search",
    });
  });

  it("changes search term", () => {
    location.search = "?search=search";
    location.pathname = "path";
    const p = fakeProps();
    const wrapper = shallow(<DesignerSettings {...p} />);
    wrapper.find(SearchField).simulate("change", "setting");
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
    const wrapper = shallow(<DesignerSettings {...p} />);
    expect(wrapper.find(Motors).props().firmwareHardware).toEqual("arduino");
  });

  it("expands all", () => {
    const p = fakeProps();
    p.settingsPanelState = settingsPanelState();
    const wrapper = mount(<DesignerSettings {...p} />);
    clickButton(wrapper, 1, "");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.BULK_TOGGLE_SETTINGS_PANEL,
      payload: true,
    });
  });

  it("collapses all", () => {
    const p = fakeProps();
    p.settingsPanelState = settingsPanelState();
    p.settingsPanelState.motors = true;
    const wrapper = mount(<DesignerSettings {...p} />);
    clickButton(wrapper, 1, "");
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
    const wrapper = mount(<DesignerSettings {...p} />);
    const confirmDeletion = getSetting(wrapper, 12, "confirm plant");
    expect(confirmDeletion.find("button").text()).toEqual("on");
  });

  it("toggles setting", () => {
    const p = fakeProps();
    p.settingsPanelState.farm_designer = true;
    const wrapper = mount(<DesignerSettings {...p} />);
    const trailSetting = getSetting(wrapper, 1, "trail");
    trailSetting.find("button").simulate("click");
    expect(setWebAppConfigValueSpy)
      .toHaveBeenCalledWith(BooleanSetting.display_trail, true);
  });

  it("changes origin", () => {
    const p = fakeProps();
    p.settingsPanelState.farm_designer = true;
    p.getConfigValue = () => 2;
    const wrapper = mount(<DesignerSettings {...p} />);
    const originSetting = getSetting(wrapper, 6, "origin");
    originSetting.find("div").last().simulate("click");
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      NumericSetting.bot_origin_quadrant, 4);
  });

  it("renders env editor", () => {
    const p = fakeProps();
    p.searchTerm = "env";
    const wrapper = mount(<DesignerSettings {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("custom settings");
  });

  it("renders setup settings", () => {
    const p = fakeProps();
    p.searchTerm = "setup";
    const wrapper = mount(<DesignerSettings {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("setup");
  });

  it("navigates to setup wizard", () => {
    const p = fakeProps();
    const wrapper = shallow(<DesignerSettings {...p} />);
    const popover = wrapper.find("Popover").first();
    const content = shallow(<div>{popover.prop("content")}</div>);
    const button = content.find("button")
      .filterWhere(btn => btn.text().toLowerCase() == "setup wizard");
    expect(button).toHaveLength(1);
    button.simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(Path.setup());
  });

  it("toggles dark mode", () => {
    const p = fakeProps();
    const wrapper = mount(<DesignerSettings {...p} />);
    wrapper.find(".dark-mode-toggle button").simulate("click");
    expect(setWebAppConfigValueSpy)
      .toHaveBeenCalledWith(BooleanSetting.dark_mode, true);
  });

  it("renders extra setting", () => {
    const p = fakeProps();
    p.searchTerm = "re-seed";
    const wrapper = mount(<DesignerSettings {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("re-seed");
  });

  it("renders interpolation settings", () => {
    const p = fakeProps();
    p.searchTerm = "interpolation";
    const wrapper = mount(<DesignerSettings {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("interpolation");
  });

  it("renders 3D settings", () => {
    const p = fakeProps();
    p.searchTerm = "3d";
    const wrapper = mount(<DesignerSettings {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("3d");
  });

  it("renders dev settings", () => {
    const p = fakeProps();
    p.searchTerm = "developer";
    const wrapper = mount(<DesignerSettings {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("unstable fe");
  });

  it("renders surprise", () => {
    location.search = "?only=surprise";
    const p = fakeProps();
    p.searchTerm = "surprise";
    const wrapper = mount(<DesignerSettings {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("attack");
  });

  it("cancels setting isolation", () => {
    location.search = "?only=setting";
    location.pathname = "path";
    const p = fakeProps();
    p.searchTerm = "";
    const wrapper = mount(<DesignerSettings {...p} />);
    clickButton(wrapper, 2, "cancel");
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
    const wrapper = mount(<DesignerSettings {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("change ownership");
  });
});
