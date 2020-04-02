let mockPath = "/app/designer/plants";
jest.mock("../../history", () => ({
  history: { getCurrentLocation: jest.fn(() => ({ pathname: mockPath })) },
  getPathArray: jest.fn(() => mockPath.split("/")),
}));

jest.mock("../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

jest.mock("../plants/plant_inventory", () => ({ Plants: () => <div /> }));

import * as React from "react";
import { RawFarmDesigner as FarmDesigner } from "../index";
import { mount } from "enzyme";
import { Props } from "../interfaces";
import { bot } from "../../__test_support__/fake_state/bot";
import {
  fakeImage, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { fakeDesignerState } from "../../__test_support__/fake_designer_state";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { fakeState } from "../../__test_support__/fake_state";
import { edit } from "../../api/crud";
import { BooleanSetting } from "../../session_keys";
import { GardenMapLegend } from "../map/legend/garden_map_legend";
import { GardenMap } from "../map/garden_map";

describe("<FarmDesigner/>", () => {
  const fakeProps = (): Props => ({
    dispatch: jest.fn(),
    selectedPlant: undefined,
    designer: fakeDesignerState(),
    hoveredPlant: undefined,
    genericPoints: [],
    weeds: [],
    allPoints: [],
    plants: [],
    toolSlots: [],
    crops: [],
    botLocationData: {
      position: { x: undefined, y: undefined, z: undefined },
      scaled_encoders: { x: undefined, y: undefined, z: undefined },
      raw_encoders: { x: undefined, y: undefined, z: undefined },
    },
    botMcuParams: bot.hardware.mcu_params,
    stepsPerMmXY: { x: undefined, y: undefined },
    peripherals: [],
    eStopStatus: false,
    latestImages: [],
    cameraCalibrationData: {
      scale: undefined, rotation: undefined,
      offset: { x: undefined, y: undefined },
      origin: undefined,
      calibrationZ: undefined
    },
    timeSettings: fakeTimeSettings(),
    getConfigValue: jest.fn(),
    sensorReadings: [],
    sensors: [],
    groups: [],
    shouldDisplay: () => false,
    mountedToolName: undefined,
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
    expect(gardenMapProps.gridSize.x).toEqual(2900);
    expect(gardenMapProps.gridSize.y).toEqual(1400);
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
    mockPath = "/app/designer/plants";
    const wrapper = mount(<FarmDesigner {...fakeProps()} />);
    expect(wrapper.find(".panel-nav").first().hasClass("hidden"))
      .toBeTruthy();
    expect(wrapper.find(".farm-designer-panels").hasClass("panel-open"))
      .toBeTruthy();
    expect(wrapper.find(".farm-designer-map").hasClass("panel-open"))
      .toBeTruthy();
  });

  it("hides panel", () => {
    mockPath = "/app/designer";
    const wrapper = mount(<FarmDesigner {...fakeProps()} />);
    expect(wrapper.find(".panel-nav").first().hasClass("hidden"))
      .toBeFalsy();
    expect(wrapper.find(".farm-designer-panels").hasClass("panel-open"))
      .toBeFalsy();
    expect(wrapper.find(".farm-designer-map").hasClass("panel-open"))
      .toBeFalsy();
  });

  it("renders saved garden indicator", () => {
    const p = fakeProps();
    p.designer.openedSavedGarden = "SavedGardenUuid";
    const wrapper = mount(<FarmDesigner {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("viewing saved garden");
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
});
