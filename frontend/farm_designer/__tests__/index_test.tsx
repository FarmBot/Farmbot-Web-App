jest.mock("../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

jest.mock("../../plants/plant_inventory", () => ({ Plants: () => <div /> }));

let mockIsMobile = false;
let mockIsDesktop = false;
jest.mock("../../screen_size", () => ({
  isMobile: () => mockIsMobile,
  isDesktop: () => mockIsDesktop,
}));

import React from "react";
import {
  getDefaultAxisLength, getGridSize, RawFarmDesigner as FarmDesigner,
} from "../index";
import { mount } from "enzyme";
import { FarmDesignerProps } from "../interfaces";
import { bot } from "../../__test_support__/fake_state/bot";
import {
  fakeImage, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { fakeDesignerState } from "../../__test_support__/fake_designer_state";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import {
  buildResourceIndex,
  fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { fakeState } from "../../__test_support__/fake_state";
import { edit } from "../../api/crud";
import { BooleanSetting } from "../../session_keys";
import { GardenMapLegend } from "../map/legend/garden_map_legend";
import { GardenMap } from "../map/garden_map";
import { fakeMountedToolInfo } from "../../__test_support__/fake_tool_info";
import {
  fakeCameraCalibrationData,
} from "../../__test_support__/fake_camera_data";
import {
  fakeBotLocationData, fakeBotSize,
} from "../../__test_support__/fake_bot_data";
import { WebAppConfig } from "farmbot/dist/resources/configs/web_app";
import { Path } from "../../internal_urls";

describe("<FarmDesigner />", () => {
  const fakeProps = (): FarmDesignerProps => ({
    dispatch: jest.fn(),
    device: fakeDevice().body,
    selectedPlant: undefined,
    designer: fakeDesignerState(),
    hoveredPlant: undefined,
    genericPoints: [],
    weeds: [],
    allPoints: [],
    plants: [],
    tools: [],
    toolSlots: [],
    crops: [],
    botLocationData: fakeBotLocationData(),
    botMcuParams: bot.hardware.mcu_params,
    botSize: fakeBotSize(),
    peripheralValues: [],
    eStopStatus: false,
    latestImages: [],
    cameraCalibrationData: fakeCameraCalibrationData(),
    timeSettings: fakeTimeSettings(),
    getConfigValue: jest.fn(),
    sensorReadings: [],
    sensors: [],
    groups: [],
    mountedToolInfo: fakeMountedToolInfo(),
    visualizedSequenceBody: [],
    logs: [],
    deviceTarget: "",
    sourceFbosConfig: () => ({ value: 1, consistent: true }),
    farmwareEnvs: [],
    curves: [],
  });

  it("loads default map settings", () => {
    const wrapper = mount(<FarmDesigner {...fakeProps()} />);
    const legendProps = wrapper.find(GardenMapLegend).props();
    expect(legendProps.legendMenuOpen).toBeFalsy();
    expect(legendProps.showPlants).toBeTruthy();
    expect(legendProps.showPoints).toBeTruthy();
    expect(legendProps.showSpread).toBeFalsy();
    expect(legendProps.showFarmbot).toBeTruthy();
    expect(legendProps.showImages).toBeFalsy();
    expect(legendProps.imageAgeInfo).toEqual({ newestDate: "", toOldest: 1 });
    const gardenMapProps = wrapper.find(GardenMap).props();
    expect(gardenMapProps.mapTransformProps.gridSize.x).toEqual(2900);
    expect(gardenMapProps.mapTransformProps.gridSize.y).toEqual(1230);
  });

  it("loads image info", () => {
    const p = fakeProps();
    const image1 = fakeImage();
    const image2 = fakeImage();
    image1.body.created_at = "2001-01-03T00:00:00.000Z";
    image2.body.created_at = "2001-01-01T00:00:00.000Z";
    p.latestImages = [image1, image2];
    const wrapper = mount(<FarmDesigner {...p} />);
    const legendProps = wrapper.find(GardenMapLegend).props();
    expect(legendProps.imageAgeInfo)
      .toEqual({ newestDate: "2001-01-03T00:00:00.000Z", toOldest: 2 });
  });

  it("renders nav titles", () => {
    location.pathname = Path.mock(Path.plants());
    const wrapper = mount(<FarmDesigner {...fakeProps()} />);
    expect(wrapper.find(".panel-nav").first().hasClass("hidden"))
      .toBeTruthy();
    expect(wrapper.find(".farm-designer-panels").hasClass("panel-open"))
      .toBeTruthy();
    expect(wrapper.find(".farm-designer-map").hasClass("panel-open"))
      .toBeTruthy();
  });

  it("hides panel", () => {
    location.pathname = Path.mock(Path.plants());
    const p = fakeProps();
    p.designer.panelOpen = false;
    const wrapper = mount(<FarmDesigner {...p} />);
    expect(wrapper.find(".panel-nav").first().hasClass("hidden"))
      .toBeFalsy();
    expect(wrapper.find(".farm-designer-panels").hasClass("panel-open"))
      .toBeFalsy();
    expect(wrapper.find(".farm-designer-map").hasClass("panel-open"))
      .toBeFalsy();
  });

  it("renders saved garden indicator", () => {
    mockIsMobile = false;
    mockIsDesktop = true;
    const p = fakeProps();
    p.designer.openedSavedGarden = 1;
    p.designer.panelOpen = false;
    const wrapper = mount(<FarmDesigner {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("viewing saved garden");
    expect(wrapper.html()).not.toContain("three-d-garden");
  });

  it("renders saved garden indicator on medium screens", () => {
    mockIsMobile = false;
    mockIsDesktop = false;
    const p = fakeProps();
    p.designer.openedSavedGarden = 1;
    p.designer.panelOpen = false;
    const wrapper = mount(<FarmDesigner {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("viewing saved garden");
    expect(wrapper.html()).not.toContain("three-d-garden");
  });

  it("doesn't render saved garden indicator", () => {
    mockIsMobile = true;
    mockIsDesktop = false;
    const p = fakeProps();
    p.designer.openedSavedGarden = 1;
    p.designer.panelOpen = false;
    const wrapper = mount(<FarmDesigner {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("viewing saved garden");
    expect(wrapper.html()).not.toContain("three-d-garden");
  });

  it("toggles setting", () => {
    const p = fakeProps();
    const state = fakeState();
    const dispatch = jest.fn();
    state.resources = buildResourceIndex([fakeWebAppConfig()]);
    p.dispatch = jest.fn(x => x(dispatch, () => state));
    const wrapper = mount<FarmDesigner>(<FarmDesigner {...p} />);
    wrapper.instance().toggle(BooleanSetting.show_plants)();
    expect(edit).toHaveBeenCalledWith(expect.any(Object), {
      bot_origin_quadrant: 2
    });
  });

  it("initializes setting", () => {
    const p = fakeProps();
    p.getConfigValue = () => false;
    const i = new FarmDesigner(p);
    expect(i.initializeSetting(BooleanSetting.show_farmbot, true)).toBeFalsy();
  });

  it("gets bot origin quadrant", () => {
    const p = fakeProps();
    p.getConfigValue = () => 1;
    const i = new FarmDesigner(p);
    expect(i.getBotOriginQuadrant()).toEqual(1);
  });

  it("renders 3D garden", () => {
    const p = fakeProps();
    p.getConfigValue = () => true;
    const wrapper = mount(<FarmDesigner {...p} />);
    expect(wrapper.html()).toContain("three-d-garden");
  });
});

describe("getDefaultAxisLength()", () => {
  it("returns axis lengths", () => {
    const axes = getDefaultAxisLength(() => false);
    expect(axes).toEqual({ x: 2900, y: 1230, z: 400 });
  });
});

describe("getGridSize()", () => {
  it("returns default grid size", () => {
    const grid = getGridSize(
      k => ({ dynamic_map: false } as WebAppConfig)[k],
      {
        x: { value: 100, isDefault: false },
        y: { value: 200, isDefault: false },
        z: { value: 400, isDefault: true },
      });
    expect(grid).toEqual({ x: 2900, y: 1230 });
  });

  it("returns custom grid size", () => {
    const grid = getGridSize(
      k => ({
        dynamic_map: false, map_size_x: 300, map_size_y: 400
      } as WebAppConfig)[k],
      {
        x: { value: 100, isDefault: false },
        y: { value: 200, isDefault: false },
        z: { value: 400, isDefault: true },
      });
    expect(grid).toEqual({ x: 300, y: 400 });
  });

  it("returns grid size using bot size", () => {
    const grid = getGridSize(
      k => ({ dynamic_map: true } as WebAppConfig)[k],
      {
        x: { value: 100, isDefault: false },
        y: { value: 200, isDefault: false },
        z: { value: 400, isDefault: true },
      });
    expect(grid).toEqual({ x: 100, y: 200 });
  });
});
