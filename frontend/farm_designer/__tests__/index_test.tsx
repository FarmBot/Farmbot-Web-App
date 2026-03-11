import React from "react";
import {
  getDefaultAxisLength, getGridSize, RawFarmDesigner as FarmDesigner,
} from "../index";
import { render } from "@testing-library/react";
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
import * as crud from "../../api/crud";
import { BooleanSetting } from "../../session_keys";
import { fakeMountedToolInfo } from "../../__test_support__/fake_tool_info";
import {
  fakeCameraCalibrationData,
} from "../../__test_support__/fake_camera_data";
import {
  fakeBotLocationData, fakeBotSize,
} from "../../__test_support__/fake_bot_data";
import { WebAppConfig } from "farmbot/dist/resources/configs/web_app";
import { Path } from "../../internal_urls";
import * as mapLegend from "../map/legend/garden_map_legend";
import * as gardenMap from "../map/garden_map";

let lastLegendProps: Record<string, unknown> | undefined;
let lastGardenMapProps: Record<string, unknown> | undefined;

const setWindowWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
};

describe("<FarmDesigner />", () => {
  let editSpy: jest.SpyInstance;
  let legendSpy: jest.SpyInstance;
  let gardenMapSpy: jest.SpyInstance;

  beforeEach(() => {
    setWindowWidth(1000);
    lastLegendProps = undefined;
    lastGardenMapProps = undefined;
    editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
    legendSpy = jest.spyOn(mapLegend, "GardenMapLegend")
      .mockImplementation((props: Record<string, unknown>) => {
        lastLegendProps = props;
        return <div className="mock-garden-map-legend" />;
      });
    gardenMapSpy = jest.spyOn(gardenMap, "GardenMap")
      .mockImplementation((props: Record<string, unknown>) => {
        lastGardenMapProps = props;
        return <div className="mock-garden-map" />;
      });
  });

  afterEach(() => {
    editSpy.mockRestore();
    legendSpy.mockRestore();
    gardenMapSpy.mockRestore();
  });

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
    render(<FarmDesigner {...fakeProps()} />);
    expect(lastLegendProps?.legendMenuOpen).toBeFalsy();
    expect(lastLegendProps?.showPlants).toBeTruthy();
    expect(lastLegendProps?.showPoints).toBeTruthy();
    expect(lastLegendProps?.showSpread).toBeFalsy();
    expect(lastLegendProps?.showFarmbot).toBeTruthy();
    expect(lastLegendProps?.showImages).toBeFalsy();
    expect(lastLegendProps?.imageAgeInfo).toEqual({ newestDate: "", toOldest: 1 });
    const mapTransformProps = (lastGardenMapProps?.mapTransformProps as
      { gridSize: { x: number; y: number } } | undefined);
    expect(mapTransformProps?.gridSize.x).toEqual(2900);
    expect(mapTransformProps?.gridSize.y).toEqual(1230);
  });

  it("loads image info", () => {
    const p = fakeProps();
    const image1 = fakeImage();
    const image2 = fakeImage();
    image1.body.created_at = "2001-01-03T00:00:00.000Z";
    image2.body.created_at = "2001-01-01T00:00:00.000Z";
    p.latestImages = [image1, image2];
    render(<FarmDesigner {...p} />);
    expect(lastLegendProps?.imageAgeInfo)
      .toEqual({ newestDate: "2001-01-03T00:00:00.000Z", toOldest: 2 });
  });

  it("renders nav titles", () => {
    location.pathname = Path.mock(Path.plants());
    const { container } = render(<FarmDesigner {...fakeProps()} />);
    expect(container.querySelector(".panel-nav")?.classList.contains("hidden"))
      .toBeTruthy();
    expect(container.querySelector(".farm-designer-panels")?.classList.contains("panel-open"))
      .toBeTruthy();
    expect(container.querySelector(".farm-designer-map")?.classList.contains("panel-open"))
      .toBeTruthy();
  });

  it("hides panel", () => {
    location.pathname = Path.mock(Path.plants());
    const p = fakeProps();
    p.designer.panelOpen = false;
    const { container } = render(<FarmDesigner {...p} />);
    expect(container.querySelector(".panel-nav")?.classList.contains("hidden"))
      .toBeFalsy();
    expect(container.querySelector(".farm-designer-panels")?.classList.contains("panel-open"))
      .toBeFalsy();
    expect(container.querySelector(".farm-designer-map")?.classList.contains("panel-open"))
      .toBeFalsy();
  });

  it("renders saved garden indicator", () => {
    setWindowWidth(1000);
    const p = fakeProps();
    p.designer.openedSavedGarden = 1;
    p.designer.panelOpen = false;
    const { container } = render(<FarmDesigner {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("viewing saved garden");
    expect(container.innerHTML).not.toContain("three-d-garden");
  });

  it("renders saved garden indicator on medium screens", () => {
    setWindowWidth(700);
    const p = fakeProps();
    p.designer.openedSavedGarden = 1;
    p.designer.panelOpen = false;
    const { container } = render(<FarmDesigner {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("viewing saved garden");
    expect(container.innerHTML).not.toContain("three-d-garden");
  });

  it("doesn't render saved garden indicator", () => {
    setWindowWidth(400);
    const p = fakeProps();
    p.designer.openedSavedGarden = 1;
    p.designer.panelOpen = false;
    const { container } = render(<FarmDesigner {...p} />);
    expect(container.textContent?.toLowerCase()).not.toContain("viewing saved garden");
    expect(container.innerHTML).not.toContain("three-d-garden");
  });

  it("toggles setting", () => {
    const p = fakeProps();
    const state = fakeState();
    const dispatch = jest.fn();
    state.resources = buildResourceIndex([fakeWebAppConfig()]);
    p.dispatch = jest.fn(x => x(dispatch, () => state));
    const ref = React.createRef<FarmDesigner>();
    render(<FarmDesigner {...p} ref={ref} />);
    ref.current?.toggle(BooleanSetting.show_plants)();
    expect(editSpy).toHaveBeenCalledWith(expect.any(Object), {
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
    p.designer.threeDTime = "12:00";
    const { container } = render(<FarmDesigner {...p} />);
    expect(container.innerHTML).toContain("three-d-garden");
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
