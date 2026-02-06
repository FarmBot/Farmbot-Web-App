let mockAtMax = false;
let mockAtMin = false;

import React from "react";
import { shallow, mount } from "enzyme";
import {
  GardenMapLegend, ZoomControls, PointsSubMenu, FarmbotSubMenu,
  PlantsSubMenu, MapSettingsContent, SettingsSubMenuProps,
  ZoomControlsProps,
} from "../garden_map_legend";
import { GardenMapLegendProps } from "../../interfaces";
import { BooleanSetting } from "../../../../session_keys";
import * as zoom from "../../zoom";
import {
  fakeTimeSettings,
} from "../../../../__test_support__/fake_time_settings";
import * as configStorageActions from "../../../../config_storage/actions";
import {
  fakeBotLocationData, fakeBotSize,
} from "../../../../__test_support__/fake_bot_data";
import {
  fakeFirmwareConfig,
} from "../../../../__test_support__/fake_state/resources";

let atMaxZoomSpy: jest.SpyInstance;
let atMinZoomSpy: jest.SpyInstance;
let getWebAppConfigValueSpy: jest.SpyInstance;
let setWebAppConfigValueSpy: jest.SpyInstance;

beforeEach(() => {
  atMaxZoomSpy = jest.spyOn(zoom, "atMaxZoom").mockImplementation(() => mockAtMax);
  atMinZoomSpy = jest.spyOn(zoom, "atMinZoom").mockImplementation(() => mockAtMin);
  getWebAppConfigValueSpy = jest.spyOn(configStorageActions, "getWebAppConfigValue")
    .mockImplementation(() => () => false);
  setWebAppConfigValueSpy = jest.spyOn(configStorageActions, "setWebAppConfigValue")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  atMaxZoomSpy.mockRestore();
  atMinZoomSpy.mockRestore();
  getWebAppConfigValueSpy.mockRestore();
  setWebAppConfigValueSpy.mockRestore();
});

describe("<GardenMapLegend />", () => {
  const fakeProps = (): GardenMapLegendProps => ({
    zoom: () => () => undefined,
    toggle: () => () => undefined,
    legendMenuOpen: true,
    showPlants: false,
    showPoints: false,
    showSoilInterpolationMap: false,
    showWeeds: false,
    showSpread: false,
    showFarmbot: false,
    showImages: false,
    showZones: false,
    showSensorReadings: false,
    showMoistureInterpolationMap: false,
    dispatch: jest.fn(),
    timeSettings: fakeTimeSettings(),
    getConfigValue: jest.fn(),
    imageAgeInfo: { newestDate: "", toOldest: 1 },
    allPoints: [],
    sourceFbosConfig: () => ({ value: 0, consistent: true }),
    firmwareConfig: fakeFirmwareConfig().body,
    botLocationData: fakeBotLocationData(),
    botSize: fakeBotSize(),
  });

  it("renders", () => {
    const wrapper = mount(<GardenMapLegend {...fakeProps()} />);
    ["plants", "move"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
    expect(wrapper.html()).toContain("filter");
    expect(wrapper.html()).toContain("extras");
    expect(wrapper.html()).not.toContain("-100");
    expect(wrapper.text().toLowerCase()).not.toContain("3d map");
  });

  it("renders with readings", () => {
    const p = fakeProps();
    const wrapper = mount(<GardenMapLegend {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("readings");
  });

  it("renders z display", () => {
    const wrapper = mount(<GardenMapLegend {...fakeProps()} />);
    wrapper.find(".fb-toggle-button").last().simulate("click");
    expect(wrapper.html()).toContain("-100");
  });
});

describe("<ZoomControls />", () => {
  const fakeProps = (): ZoomControlsProps => ({
    zoom: jest.fn(),
    getConfigValue: jest.fn(),
  });

  const expectDisabledBtnCountToEqual = (expected: number) => {
    const wrapper = shallow(<ZoomControls {...fakeProps()} />);
    expect(wrapper.find(".disabled").length).toEqual(expected);
  };

  it("zoom buttons active", () => {
    mockAtMax = false;
    mockAtMin = false;
    expectDisabledBtnCountToEqual(0);
  });

  it("zoom out button disabled", () => {
    mockAtMax = false;
    mockAtMin = true;
    expectDisabledBtnCountToEqual(1);
  });

  it("zoom in button disabled", () => {
    mockAtMax = true;
    mockAtMin = false;
    expectDisabledBtnCountToEqual(1);
  });
});

const fakeProps = (): SettingsSubMenuProps => ({
  dispatch: jest.fn(),
  getConfigValue: () => true,
  firmwareConfig: fakeFirmwareConfig().body,
});

describe("<PointsSubMenu />", () => {
  it("shows historic points", () => {
    const wrapper = mount(<PointsSubMenu {...fakeProps()} />);
    const toggleBtn = wrapper.find("button").first();
    expect(toggleBtn.text()).toEqual("yes");
    toggleBtn.simulate("click");
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      BooleanSetting.show_historic_points, false);
  });
});

describe("<PlantsSubMenu />", () => {
  it("shows plants settings", () => {
    const wrapper = mount(<PlantsSubMenu {...fakeProps()} />);
    const toggleBtn = wrapper.find("button").first();
    expect(toggleBtn.text()).toEqual("no");
    toggleBtn.simulate("click");
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      BooleanSetting.disable_animations, false);
  });
});

describe("<FarmbotSubMenu />", () => {
  it("shows farmbot settings", () => {
    const wrapper = mount(<FarmbotSubMenu {...fakeProps()} />);
    const toggleBtn = wrapper.find("button").first();
    expect(toggleBtn.text()).toEqual("yes");
    toggleBtn.simulate("click");
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      BooleanSetting.display_trail, false);
  });
});

describe("<MapSettingsContent />", () => {
  it("shows map settings", () => {
    const wrapper = mount(<MapSettingsContent {...fakeProps()} />);
    const toggleBtn = wrapper.find("button").first();
    expect(toggleBtn.text()).toEqual("yes");
    toggleBtn.simulate("click");
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith(
      BooleanSetting.dynamic_map, false);
  });
});
