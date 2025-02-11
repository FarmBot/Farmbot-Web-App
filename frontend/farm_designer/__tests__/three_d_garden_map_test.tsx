jest.mock("../../three_d_garden", () => ({
  ThreeDGarden: jest.fn(),
}));

import React from "react";
import { ThreeDGardenMapProps, ThreeDGardenMap } from "../three_d_garden_map";
import { fakeMapTransformProps } from "../../__test_support__/map_transform_props";
import { fakeBotSize } from "../../__test_support__/fake_bot_data";
import { fakeDesignerState } from "../../__test_support__/fake_designer_state";
import { fakePlant } from "../../__test_support__/fake_state/resources";
import { render } from "@testing-library/react";
import { ThreeDGarden } from "../../three_d_garden";
import { clone } from "lodash";
import { INITIAL } from "../../three_d_garden/config";

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
  });

  it("converts props", () => {
    const p = fakeProps();
    render(<ThreeDGardenMap {...p} />);
    const expectedConfig = clone(INITIAL);
    expectedConfig.bedWallThickness = 1;
    expectedConfig.bedHeight = 1;
    expectedConfig.bedLengthOuter = 3160;
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
    expect(ThreeDGarden).toHaveBeenCalledWith({
      config: expectedConfig,
      addPlantProps: expect.any(Object),
      mapPoints: [],
      weeds: [],
    }, {});
  });

  it("converts props: unknown position", () => {
    const p = fakeProps();
    p.botPosition = { x: undefined, y: undefined, z: undefined };
    render(<ThreeDGardenMap {...p} />);
    expect(ThreeDGarden).toHaveBeenCalledWith({
      config: expect.objectContaining({ x: 0, y: 0, z: 0 }),
      addPlantProps: expect.any(Object),
      mapPoints: [],
      weeds: [],
    }, {});
  });

  it("converts props: negative z", () => {
    const p = fakeProps();
    p.botPosition = { x: undefined, y: undefined, z: -100 };
    p.negativeZ = true;
    render(<ThreeDGardenMap {...p} />);
    expect(ThreeDGarden).toHaveBeenCalledWith({
      config: expect.objectContaining({ x: 0, y: 0, z: 100 }),
      addPlantProps: expect.any(Object),
      mapPoints: [],
      weeds: [],
    }, {});
  });
});
