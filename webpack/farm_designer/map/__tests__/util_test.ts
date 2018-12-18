let mockPath = "";
jest.mock("../../../history", () => ({
  getPathArray: jest.fn(() => { return mockPath.split("/"); })
}));

jest.mock("../../saved_gardens/saved_gardens", () => ({
  savedGardenOpen: () => true,
}));

import {
  round,
  translateScreenToGarden,
  getBotSize,
  getMapSize,
  transformXY,
  transformForQuadrant,
  getMode,
  getGardenCoordinates,
} from "../util";
import { McuParams } from "farmbot";
import {
  AxisNumberProperty, BotSize, MapTransformProps, Mode
} from "../interfaces";
import { StepsPerMmXY } from "../../../devices/interfaces";
import {
  fakeMapTransformProps
} from "../../../__test_support__/map_transform_props";

describe("Utils", () => {
  it("rounds a number", () => {
    expect(round(44)).toEqual(40);
    expect(round(98)).toEqual(100);
  });
});

describe("translateScreenToGarden()", () => {
  it("translates screen coords to garden coords: zoomLvl = 1", () => {
    const result = translateScreenToGarden({
      mapTransformProps: fakeMapTransformProps(),
      page: { x: 520, y: 212 },
      scroll: { left: 10, top: 20 },
      zoomLvl: 1,
      gridOffset: { x: 30, y: 40 },
      mapOnly: false,
    });
    expect(result).toEqual({ x: 180, y: 80 });
  });

  it("translates screen coords to garden coords: zoomLvl < 1", () => {
    const result = translateScreenToGarden({
      mapTransformProps: fakeMapTransformProps(),
      page: { x: 1132, y: 382 },
      scroll: { left: 10, top: 20 },
      zoomLvl: 0.33,
      gridOffset: { x: 30, y: 40 },
      mapOnly: false,
    });
    expect(result).toEqual({ x: 2470, y: 840 });
  });

  it("translates screen coords to garden coords: zoomLvl > 1", () => {
    const result = translateScreenToGarden({
      mapTransformProps: fakeMapTransformProps(),
      page: { x: 1132, y: 382 },
      scroll: { left: 10, top: 20 },
      zoomLvl: 1.5,
      gridOffset: { x: 30, y: 40 },
      mapOnly: false,
    });
    expect(result).toEqual({ x: 520, y: 150 });
  });

  it("translates screen coords to garden coords: other case", () => {
    const mapTransformProps = fakeMapTransformProps();
    mapTransformProps.quadrant = 3;
    mapTransformProps.gridSize = { x: 300, y: 150 };
    const result = translateScreenToGarden({
      mapTransformProps,
      page: { x: 332, y: 132 },
      scroll: { left: 10, top: 20 },
      zoomLvl: 0.75,
      gridOffset: { x: 30, y: 40 },
      mapOnly: false,
    });
    expect(result).toEqual({ x: 0, y: 130 });
  });

  it("translates screen coords to garden coords: swapped X&Y", () => {
    const mapTransformProps = fakeMapTransformProps();
    mapTransformProps.xySwap = true;
    mapTransformProps.quadrant = 3;
    mapTransformProps.gridSize = { x: 150, y: 300 };
    const result = translateScreenToGarden({
      mapTransformProps,
      page: { x: 332, y: 132 },
      scroll: { left: 10, top: 20 },
      zoomLvl: 0.75,
      gridOffset: { x: 30, y: 40 },
      mapOnly: false,
    });
    expect(result).toEqual({ x: 130, y: 0 });
  });

  it("translates screen coords to garden coords: panel closed", () => {
    const result = translateScreenToGarden({
      mapTransformProps: fakeMapTransformProps(),
      page: { x: 520, y: 212 },
      scroll: { left: 10, top: 20 },
      zoomLvl: 1,
      gridOffset: { x: 30, y: 40 },
      mapOnly: true,
    });
    expect(result).toEqual({ x: 480, y: 30 });
  });
});

describe("getbotSize()", () => {
  function fakeProps() {
    const botMcuParams: McuParams = {
      movement_stop_at_max_x: undefined,
      movement_stop_at_max_y: undefined,
      movement_axis_nr_steps_x: undefined,
      movement_axis_nr_steps_y: undefined
    };
    const stepsPerMmXY: StepsPerMmXY = { x: undefined, y: undefined };
    const defaultLength: AxisNumberProperty = { x: 3000, y: 1500 };
    return {
      botMcuParams,
      stepsPerMmXY,
      defaultLength
    };
  }

  function expectDefaultSize(botSize: BotSize) {
    expect(botSize).toEqual({
      x: { value: 3000, isDefault: true },
      y: { value: 1500, isDefault: true }
    });
  }

  it("returns default bed size: when settings undefined", () => {
    const p = fakeProps();
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMmXY, p.defaultLength);
    expectDefaultSize(botSize);
  });

  it("returns default bed size: when stop at max disabled", () => {
    const p = fakeProps();
    p.botMcuParams = {
      movement_stop_at_max_x: 0,
      movement_stop_at_max_y: 0,
      movement_axis_nr_steps_x: 100,
      movement_axis_nr_steps_y: 100
    };
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMmXY, p.defaultLength);
    expectDefaultSize(botSize);
  });

  it("returns default bed size: when axis length is default", () => {
    const p = fakeProps();
    p.botMcuParams = {
      movement_stop_at_max_x: 1,
      movement_stop_at_max_y: 1,
      movement_axis_nr_steps_x: 0,
      movement_axis_nr_steps_y: 0
    };
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMmXY, p.defaultLength);
    expectDefaultSize(botSize);
  });

  it("returns default bed size: when steps per mm is 0", () => {
    const p = fakeProps();
    p.botMcuParams = {
      movement_stop_at_max_x: 1,
      movement_stop_at_max_y: 1,
      movement_axis_nr_steps_x: 100,
      movement_axis_nr_steps_y: 100
    };
    p.stepsPerMmXY = { x: 0, y: 0 };
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMmXY, p.defaultLength);
    expectDefaultSize(botSize);
  });

  it("calculates correct bed size: both axes", () => {
    const p = fakeProps();
    p.botMcuParams = {
      movement_stop_at_max_x: 1,
      movement_stop_at_max_y: 1,
      movement_axis_nr_steps_x: 500,
      movement_axis_nr_steps_y: 1400
    };
    p.stepsPerMmXY = { x: 5, y: 7 };
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMmXY, p.defaultLength);
    expect(botSize).toEqual({
      x: { value: 100, isDefault: false },
      y: { value: 200, isDefault: false }
    });
  });

  it("calculates correct bed size: one axis", () => {
    const p = fakeProps();
    p.botMcuParams = {
      movement_stop_at_max_x: 0,
      movement_stop_at_max_y: 1,
      movement_axis_nr_steps_x: 500,
      movement_axis_nr_steps_y: 1400
    };
    p.stepsPerMmXY = { x: 5, y: 7 };
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMmXY, p.defaultLength);
    expect(botSize).toEqual({
      x: { value: 3000, isDefault: true },
      y: { value: 200, isDefault: false }
    });
  });
});

describe("getMapSize()", () => {
  it("calculates map size", () => {
    const mapSize = getMapSize(
      fakeMapTransformProps(),
      { x: 100, y: 50 });
    expect(mapSize).toEqual({ h: 1600, w: 3200 });
  });

  it("calculates map size: X&Y Swapped", () => {
    const fakeMPT = fakeMapTransformProps();
    fakeMPT.xySwap = true;
    const mapSize = getMapSize(
      fakeMPT,
      { x: 100, y: 50 });
    expect(mapSize).toEqual({ h: 3200, w: 1600 });
  });
});

describe("transformXY", () => {
  const mapTransformProps = fakeMapTransformProps();
  mapTransformProps.gridSize = { x: 2000, y: 1000 };

  type QXY = { qx: number, qy: number };

  const transformCheck =
    (original: QXY, transformed: QXY, transformProps: MapTransformProps) => {
      transformProps.xySwap = false;
      expect(transformXY(original.qx, original.qy, transformProps))
        .toEqual(transformed);
      expect(transformXY(transformed.qx, transformed.qy, transformProps))
        .toEqual(original);
      transformProps.xySwap = true;
      const transformedYX = { qx: transformed.qy, qy: transformed.qx };
      expect(transformXY(original.qx, original.qy, transformProps))
        .toEqual(transformedYX);
      expect(transformXY(transformed.qx, transformed.qy, transformProps))
        .toEqual({ qx: original.qy, qy: original.qx });
    };

  it("calculates transformed coordinate: quadrant 2", () => {
    const original = { qx: 100, qy: 200 };
    const transformed = { qx: 100, qy: 200 };
    mapTransformProps.quadrant = 2;
    transformCheck(original, transformed, mapTransformProps);
  });

  it("calculates transformed coordinate: quadrant 4", () => {
    const original = { qx: 100, qy: 200 };
    const transformed = { qx: 1900, qy: 800 };
    mapTransformProps.quadrant = 4;
    transformCheck(original, transformed, mapTransformProps);
  });

  it("calculates transformed coordinate: quadrant 4 (outside of grid)", () => {
    const original = { qx: 2200, qy: 1100 };
    const transformed = { qx: -200, qy: -100 };
    mapTransformProps.quadrant = 4;
    transformCheck(original, transformed, mapTransformProps);
  });
});

describe("transformForQuadrant()", () => {
  const mapTransformProps = fakeMapTransformProps();
  mapTransformProps.gridSize = { x: 200, y: 100 };

  it("calculates transform for quadrant 1", () => {
    mapTransformProps.quadrant = 1;
    expect(transformForQuadrant(mapTransformProps))
      .toEqual("scale(-1, 1) translate(-200, 0)");
  });

  it("calculates transform for quadrant 2", () => {
    mapTransformProps.quadrant = 2;
    expect(transformForQuadrant(mapTransformProps))
      .toEqual("scale(1, 1) translate(0, 0)");
  });

  it("calculates transform for quadrant 3", () => {
    mapTransformProps.quadrant = 3;
    expect(transformForQuadrant(mapTransformProps))
      .toEqual("scale(1, -1) translate(0, -100)");
  });

  it("calculates transform for quadrant 4", () => {
    mapTransformProps.quadrant = 4;
    expect(transformForQuadrant(mapTransformProps))
      .toEqual("scale(-1, -1) translate(-200, -100)");
  });
});

describe("getMode()", () => {
  it("returns correct Mode", () => {
    mockPath = "/app/designer/plants/crop_search/mint/add";
    expect(getMode()).toEqual(Mode.clickToAdd);
    mockPath = "/app/designer/plants/1/edit";
    expect(getMode()).toEqual(Mode.editPlant);
    mockPath = "/app/designer/saved_gardens/templates/1/edit";
    expect(getMode()).toEqual(Mode.editPlant);
    mockPath = "/app/designer/plants/select";
    expect(getMode()).toEqual(Mode.boxSelect);
    mockPath = "/app/designer/plants/crop_search/mint";
    expect(getMode()).toEqual(Mode.addPlant);
    mockPath = "/app/designer/plants/move_to";
    expect(getMode()).toEqual(Mode.moveTo);
    mockPath = "/app/designer/plants/create_point";
    expect(getMode()).toEqual(Mode.createPoint);
    mockPath = "/app/designer/saved_gardens";
    expect(getMode()).toEqual(Mode.templateView);
  });
});

describe("getGardenCoordinates()", () => {
  beforeEach(() => {
    Object.defineProperty(document, "querySelector", {
      value: () => ({ scrollLeft: 1, scrollTop: 2 }),
      configurable: true
    });
    Object.defineProperty(window, "getComputedStyle", {
      value: () => ({ zoom: 1 }), configurable: true
    });
  });

  const fakeProps = () => ({
    mapTransformProps: fakeMapTransformProps(),
    gridOffset: { x: 10, y: 20 },
    pageX: 500,
    pageY: 200,
  });

  it("returns garden coordinates", () => {
    const result = getGardenCoordinates(fakeProps());
    expect(result).toEqual({ x: 170, y: 70 });
  });

  it("falls back to zoom level", () => {
    Object.defineProperty(window, "getComputedStyle", {
      value: () => ({ zoom: undefined }), configurable: true
    });
    const result = getGardenCoordinates(fakeProps());
    expect(result).toEqual({ x: 170, y: 70 });
  });

  it("returns undefined", () => {
    Object.defineProperty(document, "querySelector", {
      value: () => { },
      configurable: true
    });
    const result = getGardenCoordinates(fakeProps());
    expect(result).toEqual(undefined);
  });
});
