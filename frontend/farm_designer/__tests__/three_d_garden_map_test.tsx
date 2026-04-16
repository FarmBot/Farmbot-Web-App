import React from "react";
import {
  ThreeDGardenMapProps, ThreeDGardenMap, convertPlants,
} from "../three_d_garden_map";
import { fakeMapTransformProps } from "../../__test_support__/map_transform_props";
import { fakeBotSize } from "../../__test_support__/fake_bot_data";
import { fakeDesignerState } from "../../__test_support__/fake_designer_state";
import { fakeLog, fakePlant } from "../../__test_support__/fake_state/resources";
import { render } from "@testing-library/react";
import { clone } from "lodash";
import { INITIAL, SurfaceDebugOption } from "../../three_d_garden/config";
import { FirmwareHardware } from "farmbot";
import { CROPS } from "../../crops/constants";
import { fakeDevice } from "../../__test_support__/resource_index_builder";
import { fakeCameraCalibrationData } from "../../__test_support__/fake_camera_data";
import * as threeDGarden from "../../three_d_garden";
import * as suncalc from "suncalc";

let threeDGardenSpy: jest.SpyInstance;
let getPositionSpy: jest.SpyInstance;

beforeEach(() => {
  threeDGardenSpy = jest.spyOn(threeDGarden, "ThreeDGarden")
    .mockImplementation(jest.fn(() => <div />) as never);
  getPositionSpy = jest.spyOn(suncalc, "getPosition").mockReturnValue({
    altitude: 0.5,
    azimuth: 1.0,
  } as never);
});

afterEach(() => {
  threeDGardenSpy.mockRestore();
  getPositionSpy.mockRestore();
});

const EMPTY_PROPS = {
  mapPoints: [],
  weeds: [],
  allPoints: [],
  groups: [],
  images: [],
  sensors: [],
  sensorReadings: [],
};

describe("<ThreeDGardenMap />", () => {
  const lastThreeDGardenProps = () => {
    const calls = (threeDGarden.ThreeDGarden as jest.Mock).mock.calls;
    return calls[calls.length - 1]?.[0];
  };

  const fakeProps = (): ThreeDGardenMapProps => ({
    mapTransformProps: fakeMapTransformProps(),
    device: fakeDevice().body,
    botSize: fakeBotSize(),
    gridOffset: { x: 10, y: 10 },
    get3DConfigValue: () => 1,
    sourceFbosConfig: () => ({ value: 0, consistent: true }),
    designer: fakeDesignerState(),
    plants: [fakePlant()],
    dispatch: jest.fn(),
    getWebAppConfigValue: jest.fn(),
    curves: [],
    mapPoints: [],
    weeds: [],
    botPosition: { x: 1, y: 2, z: 3 },
    negativeZ: false,
    mountedToolName: undefined,
    peripheralValues: [],
    allPoints: [],
    groups: [],
    images: [],
    sensors: [],
    sensorReadings: [],
    cameraCalibrationData: fakeCameraCalibrationData(),
    farmwareEnvs: [],
    logs: [],
  });

  it("converts props", () => {
    const p = fakeProps();
    render(<ThreeDGardenMap {...p} />);
    const expectedConfig = clone(INITIAL);
    expectedConfig.bedWallThickness = 1;
    expectedConfig.bedHeight = 1;
    expectedConfig.bedLengthOuter = 3280;
    expectedConfig.bedWidthOuter = 1660;
    expectedConfig.botSizeX = 3000;
    expectedConfig.botSizeY = 1500;
    expectedConfig.ccSupportSize = 1;
    expectedConfig.beamLength = 1;
    expectedConfig.columnLength = 1;
    expectedConfig.zAxisLength = 1;
    expectedConfig.bedXOffset = 1;
    expectedConfig.bedYOffset = 1;
    expectedConfig.bedZOffset = 1;
    expectedConfig.legSize = 1;
    expectedConfig.extraLegsY = 1;
    expectedConfig.bounds = true;
    expectedConfig.grid = true;
    expectedConfig.pan = true;
    expectedConfig.zoom = true;
    expectedConfig.soilHeight = 0;
    expectedConfig.zGantryOffset = 0;
    expectedConfig.zoomBeacons = false;
    expectedConfig.waterFlow = false;
    expectedConfig.animate = true;
    expectedConfig.ambient = 1;
    expectedConfig.sun = 1;
    expectedConfig.bedBrightness = 1;
    expectedConfig.soilBrightness = 1;
    expectedConfig.cableDebug = true;
    expectedConfig.eventDebug = true;
    expectedConfig.lightsDebug = true;
    expectedConfig.moistureDebug = true;
    expectedConfig.surfaceDebug = SurfaceDebugOption.normals;
    expectedConfig.lowDetail = true;
    expectedConfig.solar = true;
    expectedConfig.stats = true;
    expectedConfig.heading = 1;
    expectedConfig.north = true;
    expectedConfig.desk = true;
    expectedConfig.laser = true;
    expectedConfig.threeAxes = true;
    expectedConfig.sunAzimuth = 1;
    expectedConfig.sunInclination = 1;
    expectedConfig.scene = "Lab";
    expectedConfig.plants = "";
    expectedConfig.axes = true;
    expectedConfig.people = true;
    expectedConfig.xyDimensions = true;
    expectedConfig.zDimension = true;
    expectedConfig.imgScale = 0.6;
    expectedConfig.imgCenterX = 0;
    expectedConfig.imgCenterY = 0;

    const call = lastThreeDGardenProps();
    expect(call).toEqual(expect.objectContaining({
      config: expectedConfig,
      configPosition: { x: 1, y: 2, z: 3 },
      threeDPlants: [{
        id: expect.any(Number),
        icon: expect.any(String),
        key: "",
        label: "Strawberry Plant 1",
        seed: 0,
        size: 50,
        spread: 30,
        x: 100,
        y: 200,
      }],
      addPlantProps: expect.any(Object),
      ...EMPTY_PROPS,
    }));
  });

  it("converts props: unknown position", () => {
    const p = fakeProps();
    p.botPosition = { x: undefined, y: undefined, z: undefined };
    p.plants = [];
    render(<ThreeDGardenMap {...p} />);
    const call = lastThreeDGardenProps();
    expect(call).toEqual(expect.objectContaining({
      configPosition: { x: 0, y: 0, z: 0 },
      threeDPlants: [],
      addPlantProps: expect.any(Object),
      ...EMPTY_PROPS,
    }));
  });

  it("converts props: negative z", () => {
    const p = fakeProps();
    p.botPosition = { x: undefined, y: undefined, z: -100 };
    p.negativeZ = true;
    p.plants = [];
    render(<ThreeDGardenMap {...p} />);
    const call = lastThreeDGardenProps();
    expect(call).toEqual(expect.objectContaining({
      config: expect.objectContaining({ negativeZ: true }),
      configPosition: { x: 0, y: 0, z: -100 },
      threeDPlants: [],
      addPlantProps: expect.any(Object),
      ...EMPTY_PROPS,
    }));
  });

  it("converts props: real time", () => {
    const p = fakeProps();
    p.designer.threeDTime = undefined;
    p.device.lat = 1;
    p.device.lng = 2;
    p.plants = [];
    render(<ThreeDGardenMap {...p} />);
    const callArgs = lastThreeDGardenProps();
    expect(callArgs).toEqual(expect.objectContaining({
      config: expect.objectContaining({
        sunInclination: expect.any(Number),
        sunAzimuth: expect.any(Number),
        sun: 1,
      }),
      threeDPlants: [],
      addPlantProps: expect.any(Object),
      ...EMPTY_PROPS,
    }));
    expect(callArgs).toBeTruthy();
    if (!callArgs) { return; }
    expect(callArgs.config.sunInclination).not.toEqual(-1);
    expect(callArgs.config.sunAzimuth).not.toEqual(-1);
    expect(callArgs.config.sunInclination).toBeGreaterThanOrEqual(-90);
    expect(callArgs.config.sunInclination).toBeLessThanOrEqual(90);
    expect(callArgs.config.sunAzimuth).toBeGreaterThanOrEqual(0);
    expect(callArgs.config.sunAzimuth).toBeLessThanOrEqual(360);
  });

  it("converts props: night", () => {
    const p = fakeProps();
    p.designer.threeDTime = undefined;
    p.get3DConfigValue = () => -1;
    p.plants = [];
    render(<ThreeDGardenMap {...p} />);
    const call = lastThreeDGardenProps();
    expect(call).toEqual(expect.objectContaining({
      config: expect.objectContaining({
        sunInclination: -1,
        sunAzimuth: -1,
        sun: -1,
      }),
      threeDPlants: [],
      addPlantProps: expect.any(Object),
      ...EMPTY_PROPS,
    }));
  });

  it("converts props: logs", () => {
    const p = fakeProps();
    const log = fakeLog();
    log.uuid = "Log.0.123";
    log.body.id = 0;
    log.body.message = "Taking photo";
    p.logs = [log];
    p.plants = [];
    render(<ThreeDGardenMap {...p} />);
    const call = lastThreeDGardenProps();
    expect(call).toEqual(expect.objectContaining({
      config: expect.objectContaining({
        lastImageCapture: 123,
      }),
      threeDPlants: [],
      addPlantProps: expect.any(Object),
      ...EMPTY_PROPS,
    }));
  });

  it.each<[FirmwareHardware, string]>([
    ["farmduino", "v1.7"],
    ["farmduino_k17", "v1.7"],
    ["farmduino_k18", "v1.8"],
  ])("converts props: kitVersion", (firmwareHardware, kitVersion) => {
    const p = fakeProps();
    p.plants = [];
    p.sourceFbosConfig = () => ({ value: firmwareHardware, consistent: true });
    render(<ThreeDGardenMap {...p} />);
    const call = lastThreeDGardenProps();
    expect(call).toEqual(expect.objectContaining({
      config: expect.objectContaining({ kitVersion }),
      threeDPlants: [],
      addPlantProps: expect.any(Object),
      ...EMPTY_PROPS,
    }));
  });

  it("shows active peripherals", () => {
    const p = fakeProps();
    p.peripheralValues = [{ label: "watering nozzle", value: true }];
    p.plants = [];
    render(<ThreeDGardenMap {...p} />);
    const call = lastThreeDGardenProps();
    expect(call).toEqual(expect.objectContaining({
      config: expect.objectContaining({ waterFlow: true }),
      threeDPlants: [],
      addPlantProps: expect.any(Object),
      ...EMPTY_PROPS,
    }));
  });

  it.each<[boolean, boolean, number]>([
    [false, false, 0],
    [true, false, 1],
    [false, true, -1],
    [true, true, 0],
  ])("shows rotary tool state: fwd: %s rev: %s", (fwd, rev, exp) => {
    const p = fakeProps();
    p.peripheralValues = [
      { label: "rotary tool", value: fwd },
      { label: "rotary tool reverse", value: rev },
    ];
    p.plants = [];
    render(<ThreeDGardenMap {...p} />);
    const call = lastThreeDGardenProps();
    expect(call).toEqual(expect.objectContaining({
      config: expect.objectContaining({ rotary: exp }),
      threeDPlants: [],
      addPlantProps: expect.any(Object),
      ...EMPTY_PROPS,
    }));
  });
});

describe("convertPlants()", () => {
  it("converts plants", () => {
    const config = clone(INITIAL);
    config.bedXOffset = 10;
    config.bedYOffset = 1;

    const plant0 = fakePlant();
    plant0.body.name = "Spinach";
    plant0.body.openfarm_slug = "spinach";
    plant0.body.x = 100;
    plant0.body.y = 200;

    const plant1 = fakePlant();
    plant1.body.name = "Unknown";
    plant1.body.openfarm_slug = "not-set";
    plant1.body.x = 1000;
    plant1.body.y = 2000;

    const plants = [plant0, plant1];

    const convertedPlants = convertPlants(config, plants);

    expect(convertedPlants).toEqual([{
      icon: CROPS.spinach.icon,
      id: expect.any(Number),
      key: "",
      label: "Spinach",
      seed: 0,
      size: 50,
      spread: 20,
      x: 100,
      y: 200,
    },
    {
      icon: CROPS["generic-plant"].icon,
      id: expect.any(Number),
      key: "",
      label: "Unknown",
      seed: 0,
      size: 50,
      spread: 0,
      x: 1000,
      y: 2000,
    },
    ]);
  });
});
