jest.mock("../../../config_storage/actions", () => ({
  getWebAppConfigValue: jest.fn(x => { x(); return jest.fn(() => true); }),
  setWebAppConfigValue: jest.fn(),
}));

let mockDev = false;
jest.mock("../../../account/dev/dev_support", () => ({
  DevSettings: {
    futureFeature1Enabled: () => mockDev,
    futureFeaturesEnabled: () => mockDev,
    overriddenFbosVersion: jest.fn(),
  }
}));

jest.mock("../../../devices/components/maybe_highlight", () => ({
  maybeOpenPanel: jest.fn(),
  Highlight: (p: { children: React.ReactChild }) => <div>{p.children}</div>,
}));

import * as React from "react";
import { mount, ReactWrapper, shallow } from "enzyme";
import { RawDesignerSettings as DesignerSettings } from "..";
import { DesignerSettingsProps } from "../interfaces";
import { BooleanSetting, NumericSetting } from "../../../session_keys";
import { setWebAppConfigValue } from "../../../config_storage/actions";
import {
  buildResourceIndex, fakeDevice,
} from "../../../__test_support__/resource_index_builder";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { bot } from "../../../__test_support__/fake_state/bot";
import { clickButton } from "../../../__test_support__/helpers";
import { Actions } from "../../../constants";
import { Motors } from "../hardware_settings";
import { SearchField } from "../../../ui/search_field";
import { maybeOpenPanel } from "../../../devices/components/maybe_highlight";

const getSetting =
  (wrapper: ReactWrapper, position: number, containsString: string) => {
    const setting = wrapper.find(".designer-setting").at(position);
    expect(setting.text().toLowerCase())
      .toContain(containsString.toLowerCase());
    return setting;
  };

describe("<DesignerSettings />", () => {
  beforeEach(() => {
    mockDev = false;
  });

  const fakeProps = (): DesignerSettingsProps => ({
    dispatch: jest.fn(),
    getConfigValue: jest.fn(),
    firmwareConfig: undefined,
    sourceFwConfig: () => ({ value: 10, consistent: true }),
    sourceFbosConfig: () => ({ value: 10, consistent: true }),
    resources: buildResourceIndex().index,
    deviceAccount: fakeDevice(),
    env: {},
    alerts: [],
    shouldDisplay: jest.fn(),
    saveFarmwareEnv: jest.fn(),
    timeSettings: fakeTimeSettings(),
    bot: bot,
    searchTerm: "",
  });

  it("renders settings", () => {
    const wrapper = mount(<DesignerSettings {...fakeProps()} />);
    expect(wrapper.text()).toContain("size");
    expect(wrapper.text().toLowerCase()).not.toContain("pin");
    const settings = wrapper.find(".designer-setting");
    expect(settings.length).toEqual(7);
  });

  it("renders all settings", () => {
    mockDev = true;
    const wrapper = mount(<DesignerSettings {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("pin");
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
    expect(p.dispatch).not.toHaveBeenCalledWith({
      type: Actions.BULK_TOGGLE_CONTROL_PANEL,
      payload: { open: true, all: true },
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SETTINGS_SEARCH_TERM,
      payload: "setting",
    });
  });

  it("changes search term and opens sections", () => {
    mockDev = true;
    const p = fakeProps();
    const wrapper = shallow(<DesignerSettings {...p} />);
    wrapper.find(SearchField).simulate("change", "setting");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.BULK_TOGGLE_CONTROL_PANEL,
      payload: { open: true, all: true },
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SETTINGS_SEARCH_TERM,
      payload: "setting",
    });
  });

  it("fetches firmware_hardware", () => {
    mockDev = true;
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: "arduino", consistent: true });
    const wrapper = mount(<DesignerSettings {...p} />);
    expect(wrapper.find(Motors).props().firmwareHardware).toEqual("arduino");
  });

  it("expands all", () => {
    mockDev = true;
    const p = fakeProps();
    const wrapper = mount(<DesignerSettings {...p} />);
    clickButton(wrapper, 0, "expand all");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.BULK_TOGGLE_CONTROL_PANEL,
      payload: { open: true, all: true },
    });
  });

  it("collapses all", () => {
    mockDev = true;
    const p = fakeProps();
    const wrapper = mount(<DesignerSettings {...p} />);
    clickButton(wrapper, 1, "collapse all");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.BULK_TOGGLE_CONTROL_PANEL,
      payload: { open: false, all: true },
    });
  });

  it("renders defaultOn setting", () => {
    const p = fakeProps();
    p.getConfigValue = () => undefined;
    const wrapper = mount(<DesignerSettings {...p} />);
    const confirmDeletion = getSetting(wrapper, 6, "confirm plant");
    expect(confirmDeletion.find("button").text()).toEqual("on");
  });

  it("toggles setting", () => {
    const wrapper = mount(<DesignerSettings {...fakeProps()} />);
    const trailSetting = getSetting(wrapper, 1, "trail");
    trailSetting.find("button").simulate("click");
    expect(setWebAppConfigValue)
      .toHaveBeenCalledWith(BooleanSetting.display_trail, true);
  });

  it("changes origin", () => {
    const p = fakeProps();
    p.getConfigValue = () => 2;
    const wrapper = mount(<DesignerSettings {...p} />);
    const originSetting = getSetting(wrapper, 5, "origin");
    originSetting.find("div").last().simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      NumericSetting.bot_origin_quadrant, 4);
  });
});
