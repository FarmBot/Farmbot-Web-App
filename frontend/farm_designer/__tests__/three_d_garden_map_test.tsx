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
import { ASSETS } from "../../three_d_garden/constants";

describe("<ThreeDGardenMap />", () => {
  const fakeProps = (): ThreeDGardenMapProps => ({
    mapTransformProps: fakeMapTransformProps(),
    botSize: fakeBotSize(),
    gridOffset: { x: 10, y: 10 },
    get3DConfigValue: () => 1,
    sourceFbosConfig: () => ({ value: 0, consistent: true }),
    designer: fakeDesignerState(),
    plants: [fakePlant()],
  });

  it("converts props", () => {
    const p = fakeProps();
    const plant0 = fakePlant();
    plant0.body.name = "Spinach";
    plant0.body.openfarm_slug = "spinach";
    const plant1 = fakePlant();
    plant1.body.name = "Unknown";
    plant1.body.openfarm_slug = "not-set";
    p.plants = [plant0, plant1];
    render(<ThreeDGardenMap {...p} />);
    const expectedConfig = clone(INITIAL);
    expectedConfig.bedWallThickness = 1;
    expectedConfig.bedHeight = 1;
    expectedConfig.bedLengthOuter = 3160;
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
    expectedConfig.bounds = true;
    expectedConfig.grid = true;
    expectedConfig.pan = true;
    expectedConfig.zoom = true;
    expectedConfig.soilHeight = 0;
    expectedConfig.zGantryOffset = 0;
    expectedConfig.zoomBeacons = false;
    expect(ThreeDGarden).toHaveBeenCalledWith({
      config: expectedConfig,
      plants: [
        {
          icon: ASSETS.icons.spinach,
          label: "Spinach",
          size: 50,
          spread: 0,
          x: 101,
          y: 201,
        },
        {
          icon: ASSETS.icons.arugula,
          label: "Unknown",
          size: 50,
          spread: 0,
          x: 101,
          y: 201,
        },
      ],
    }, {});
  });
});
