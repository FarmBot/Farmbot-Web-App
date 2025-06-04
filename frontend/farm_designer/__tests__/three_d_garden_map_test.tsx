jest.mock("../../three_d_garden", () => ({
  ThreeDGarden: jest.fn(),
}));

import React from "react";
import {
  ThreeDGardenMapProps, ThreeDGardenMap, convertPlants,
} from "../three_d_garden_map";
import { fakeMapTransformProps } from "../../__test_support__/map_transform_props";
import { fakeBotSize } from "../../__test_support__/fake_bot_data";
import { fakeDesignerState } from "../../__test_support__/fake_designer_state";
import { fakePlant } from "../../__test_support__/fake_state/resources";
import { render } from "@testing-library/react";
import { ThreeDGarden } from "../../three_d_garden";
import { clone } from "lodash";
import { INITIAL } from "../../three_d_garden/config";
import { FirmwareHardware } from "farmbot";
import { CROPS } from "../../crops/constants";

describe("<ThreeDGardenMap />", () => {
  const fakeProps = (): ThreeDGardenMapProps => ({
    mapTransformProps: fakeMapTransformProps(),
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
    expectedConfig.x = 1;
    expectedConfig.y = 2;
    expectedConfig.z = 3;
    expectedConfig.ccSupportSize = 1;
    expectedConfig.beamLength = 1;
    expectedConfig.columnLength = 1;
    expectedConfig.zAxisLength = 1;
    expectedConfig.bedXOffset = 1;
    expectedConfig.bedYOffset = 1;
    expectedConfig.bedZOffset = 1;
    expectedConfig.legSize = 1;
    expectedConfig.bounds = true;
    expectedConfig.grid = true;
    expectedConfig.pan = true;
    expectedConfig.zoom = true;
    expectedConfig.soilHeight = 0;
    expectedConfig.zGantryOffset = 0;
    expectedConfig.zoomBeacons = false;
    expectedConfig.waterFlow = false;
    expect(ThreeDGarden).toHaveBeenCalledWith({
      config: expectedConfig,
      threeDPlants: [{
        id: expect.any(Number),
        icon: expect.any(String),
        label: "Strawberry Plant 1",
        size: 50,
        spread: 0,
        x: 101,
        y: 201,
      }],
      addPlantProps: expect.any(Object),
      mapPoints: [],
      weeds: [],
    }, {});
  });

  it("converts props: unknown position", () => {
    const p = fakeProps();
    p.botPosition = { x: undefined, y: undefined, z: undefined };
    p.plants = [];
    render(<ThreeDGardenMap {...p} />);
    expect(ThreeDGarden).toHaveBeenCalledWith({
      config: expect.objectContaining({ x: 0, y: 0, z: 0 }),
      threeDPlants: [],
      addPlantProps: expect.any(Object),
      mapPoints: [],
      weeds: [],
    }, {});
  });

  it("converts props: negative z", () => {
    const p = fakeProps();
    p.botPosition = { x: undefined, y: undefined, z: -100 };
    p.negativeZ = true;
    p.plants = [];
    render(<ThreeDGardenMap {...p} />);
    expect(ThreeDGarden).toHaveBeenCalledWith({
      config: expect.objectContaining({ negativeZ: true, x: 0, y: 0, z: -100 }),
      threeDPlants: [],
      addPlantProps: expect.any(Object),
      mapPoints: [],
      weeds: [],
    }, {});
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
    expect(ThreeDGarden).toHaveBeenCalledWith({
      config: expect.objectContaining({ kitVersion }),
      threeDPlants: [],
      addPlantProps: expect.any(Object),
      mapPoints: [],
      weeds: [],
    }, {});
  });

  it("shows active peripherals", () => {
    const p = fakeProps();
    p.peripheralValues = [{ label: "watering nozzle", value: true }];
    p.plants = [];
    render(<ThreeDGardenMap {...p} />);
    expect(ThreeDGarden).toHaveBeenCalledWith({
      config: expect.objectContaining({ waterFlow: true }),
      threeDPlants: [],
      addPlantProps: expect.any(Object),
      mapPoints: [],
      weeds: [],
    }, {});
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
      label: "Spinach",
      size: 50,
      spread: 0,
      x: 110,
      y: 201,
    },
    {
      icon: CROPS["generic-plant"].icon,
      id: expect.any(Number),
      label: "Unknown",
      size: 50,
      spread: 0,
      x: 1010,
      y: 2001,
    },
    ]);
  });
});
