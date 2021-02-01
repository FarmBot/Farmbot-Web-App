jest.mock("../../config_storage/actions", () => ({
  getWebAppConfigValue: jest.fn(x => { x(); return jest.fn(() => true); }),
  setWebAppConfigValue: jest.fn(),
}));

jest.mock("../../settings/maybe_highlight", () => ({
  maybeOpenPanel: jest.fn(),
  Highlight: (p: { children: React.ReactChild }) => <div>{p.children}</div>,
  getHighlightName: jest.fn(),
}));

import React from "react";
import { mount, ReactWrapper, shallow } from "enzyme";
import { RawDesignerSettings as DesignerSettings } from "../index";
import { DesignerSettingsProps } from "../interfaces";
import { BooleanSetting, NumericSetting } from "../../session_keys";
import { setWebAppConfigValue } from "../../config_storage/actions";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { bot } from "../../__test_support__/fake_state/bot";
import { clickButton } from "../../__test_support__/helpers";
import { Actions } from "../../constants";
import { Motors } from "../hardware_settings";
import { SearchField } from "../../ui/search_field";
import { maybeOpenPanel } from "../maybe_highlight";
import { ControlPanelState } from "../../devices/interfaces";
import { panelState } from "../../__test_support__/control_panel_state";
import { fakeUser } from "../../__test_support__/fake_state/resources";

const getSetting =
  (wrapper: ReactWrapper, position: number, containsString: string) => {
    const setting = wrapper.find(".designer-setting").at(position);
    expect(setting.text().toLowerCase())
      .toContain(containsString.toLowerCase());
    return setting;
  };

describe("<DesignerSettings />", () => {
  Object.keys(bot.controlPanelState).map((key: keyof ControlPanelState) =>
    bot.controlPanelState[key] = true);

  const fakeProps = (): DesignerSettingsProps => ({
    dispatch: jest.fn(),
    getConfigValue: jest.fn(),
    firmwareConfig: undefined,
    sourceFwConfig: () => ({ value: 10, consistent: true }),
    sourceFbosConfig: () => ({ value: 10, consistent: true }),
    resources: buildResourceIndex().index,
    deviceAccount: fakeDevice(),
    alerts: [],
    shouldDisplay: jest.fn(),
    saveFarmwareEnv: jest.fn(),
    timeSettings: fakeTimeSettings(),
    bot: bot,
    searchTerm: "",
    user: fakeUser(),
  });

  it("renders settings", () => {
    const wrapper = mount(<DesignerSettings {...fakeProps()} />);
    expect(wrapper.text()).toContain("size");
    expect(wrapper.text().toLowerCase()).toContain("pin");
    const settings = wrapper.find(".designer-setting");
    expect(settings.length).toBeGreaterThanOrEqual(8);
    expect(wrapper.text().toLowerCase()).not.toContain("unstable fe");
  });

  it("mounts", () => {
    mount(<DesignerSettings {...fakeProps()} />);
    expect(maybeOpenPanel).toHaveBeenCalled();
  });

  it("unmounts", () => {
    const p = fakeProps();
    const wrapper = mount(<DesignerSettings {...p} />);
    wrapper.unmount();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SETTINGS_SEARCH_TERM,
      payload: "",
    });
  });

  it("changes search term", () => {
    const p = fakeProps();
    const wrapper = shallow(<DesignerSettings {...p} />);
    wrapper.find(SearchField).simulate("change", "setting");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.BULK_TOGGLE_CONTROL_PANEL,
      payload: true,
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SETTINGS_SEARCH_TERM,
      payload: "setting",
    });
  });

  it("fetches firmware_hardware", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: "arduino", consistent: true });
    const wrapper = mount(<DesignerSettings {...p} />);
    expect(wrapper.find(Motors).props().firmwareHardware).toEqual("arduino");
  });

  it("expands all", () => {
    const p = fakeProps();
    p.bot.controlPanelState = panelState();
    const wrapper = mount(<DesignerSettings {...p} />);
    clickButton(wrapper, 0, "");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.BULK_TOGGLE_CONTROL_PANEL,
      payload: true,
    });
  });

  it("collapses all", () => {
    const p = fakeProps();
    p.bot.controlPanelState = panelState();
    p.bot.controlPanelState.motors = true;
    const wrapper = mount(<DesignerSettings {...p} />);
    clickButton(wrapper, 0, "");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.BULK_TOGGLE_CONTROL_PANEL,
      payload: false,
    });
  });

  it("renders defaultOn setting", () => {
    const p = fakeProps();
    p.bot.controlPanelState.farm_designer = true;
    p.getConfigValue = () => undefined;
    const wrapper = mount(<DesignerSettings {...p} />);
    const confirmDeletion = getSetting(wrapper, 9, "confirm plant");
    expect(confirmDeletion.find("button").text()).toEqual("on");
  });

  it("toggles setting", () => {
    const p = fakeProps();
    p.bot.controlPanelState.farm_designer = true;
    const wrapper = mount(<DesignerSettings {...p} />);
    const trailSetting = getSetting(wrapper, 1, "trail");
    trailSetting.find("button").simulate("click");
    expect(setWebAppConfigValue)
      .toHaveBeenCalledWith(BooleanSetting.display_trail, true);
  });

  it("changes origin", () => {
    const p = fakeProps();
    p.bot.controlPanelState.farm_designer = true;
    p.getConfigValue = () => 2;
    const wrapper = mount(<DesignerSettings {...p} />);
    const originSetting = getSetting(wrapper, 6, "origin");
    originSetting.find("div").last().simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      NumericSetting.bot_origin_quadrant, 4);
  });

  it("renders dev settings", () => {
    const p = fakeProps();
    p.searchTerm = "developer";
    const wrapper = mount(<DesignerSettings {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("unstable fe");
  });
});
