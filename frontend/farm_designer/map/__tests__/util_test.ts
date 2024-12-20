let mockIsMobile = false;
jest.mock("../../../screen_size", () => ({
  isMobile: () => mockIsMobile,
}));

import { fakeState } from "../../../__test_support__/fake_state";
const mockState = fakeState();
jest.mock("../../../redux/store", () => ({
  store: { getState: () => mockState },
}));

import {
  round,
  translateScreenToGarden,
  getBotSize,
  getMapSize,
  transformXY,
  transformForQuadrant,
  getGardenCoordinates,
  MapPanelStatus,
  mapPanelClassName,
  getMode,
  cursorAtPlant,
  allowInteraction,
  allowGroupAreaInteraction,
  savedGardenOpen,
  scaleIcon,
  defaultSpreadCmDia,
  GetGardenCoordinatesProps,
} from "../util";
import { McuParams, Xyz } from "farmbot";
import { BotSize, MapTransformProps, Mode } from "../interfaces";
import { StepsPerMm } from "../../../devices/interfaces";
import {
  fakeMapTransformProps,
} from "../../../__test_support__/map_transform_props";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { Path } from "../../../internal_urls";
import { BotOriginQuadrant } from "../../interfaces";
import { fakeDesignerState } from "../../../__test_support__/fake_designer_state";

describe("round()", () => {
  it("rounds a number", () => {
    expect(round(44)).toEqual(40);
    expect(round(98)).toEqual(100);
  });
});

describe("mapPanelClassName()", () => {
  it("returns correct panel status: short panel", () => {
    location.pathname = Path.mock(Path.location());
    const designer = fakeDesignerState();
    mockIsMobile = true;
    expect(mapPanelClassName(designer)).toEqual("short-panel");
    location.pathname = Path.mock(Path.cropSearch("mint/add"));
    expect(mapPanelClassName(designer)).toEqual("short-panel");
  });

  it("returns correct panel status: panel open", () => {
    location.pathname = Path.mock(Path.location());
    const designer = fakeDesignerState();
    mockIsMobile = false;
    expect(mapPanelClassName(designer)).toEqual("panel-open");
    location.pathname = Path.mock(Path.cropSearch("mint/add"));
    expect(mapPanelClassName(designer)).toEqual("panel-open");
  });

  it("returns correct panel status: panel closed", () => {
    location.pathname = Path.mock(Path.plants());
    const designer = fakeDesignerState();
    designer.panelOpen = false;
    mockIsMobile = false;
    expect(mapPanelClassName(designer)).toEqual("panel-closed");
    mockIsMobile = true;
    expect(mapPanelClassName(designer)).toEqual("panel-closed-mobile");
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
      panelStatus: MapPanelStatus.open,
    });
    expect(result).toEqual({ x: 30, y: 100 });
  });

  it("translates screen coords to garden coords: zoomLvl < 1", () => {
    const result = translateScreenToGarden({
      mapTransformProps: fakeMapTransformProps(),
      page: { x: 1132, y: 382 },
      scroll: { left: 10, top: 20 },
      zoomLvl: 0.33,
      gridOffset: { x: 30, y: 40 },
      panelStatus: MapPanelStatus.open,
    });
    expect(result).toEqual({ x: 1990, y: 910 });
  });

  it("translates screen coords to garden coords: zoomLvl > 1", () => {
    const result = translateScreenToGarden({
      mapTransformProps: fakeMapTransformProps(),
      page: { x: 1132, y: 382 },
      scroll: { left: 10, top: 20 },
      zoomLvl: 1.5,
      gridOffset: { x: 30, y: 40 },
      panelStatus: MapPanelStatus.open,
    });
    expect(result).toEqual({ x: 410, y: 170 });
  });

  it("translates screen coords to garden coords: other case", () => {
    const mapTransformProps = fakeMapTransformProps();
    mapTransformProps.quadrant = 3;
    mapTransformProps.gridSize = { x: 300, y: 150 };
    const result = translateScreenToGarden({
      mapTransformProps,
      page: { x: 532, y: 132 },
      scroll: { left: 10, top: 20 },
      zoomLvl: 0.75,
      gridOffset: { x: 30, y: 40 },
      panelStatus: MapPanelStatus.open,
    });
    expect(result).toEqual({ x: 60, y: 110 });
  });

  it("translates screen coords to garden coords: swapped X&Y", () => {
    const mapTransformProps = fakeMapTransformProps();
    mapTransformProps.xySwap = true;
    mapTransformProps.quadrant = 3;
    mapTransformProps.gridSize = { x: 150, y: 300 };
    const result = translateScreenToGarden({
      mapTransformProps,
      page: { x: 532, y: 132 },
      scroll: { left: 10, top: 20 },
      zoomLvl: 0.75,
      gridOffset: { x: 30, y: 40 },
      panelStatus: MapPanelStatus.open,
    });
    expect(result).toEqual({ x: 110, y: 60 });
  });

  it("translates screen coords to garden coords: panel closed", () => {
    const result = translateScreenToGarden({
      mapTransformProps: fakeMapTransformProps(),
      page: { x: 520, y: 212 },
      scroll: { left: 10, top: 20 },
      zoomLvl: 1,
      gridOffset: { x: 30, y: 40 },
      panelStatus: MapPanelStatus.closed,
    });
    expect(result).toEqual({ x: 490, y: 100 });
  });

  it("translates screen coords to garden coords: panel closed mobile", () => {
    const result = translateScreenToGarden({
      mapTransformProps: fakeMapTransformProps(),
      page: { x: 520, y: 212 },
      scroll: { left: 10, top: 20 },
      zoomLvl: 1,
      gridOffset: { x: 30, y: 40 },
      panelStatus: MapPanelStatus.mobileClosed,
    });
    expect(result).toEqual({ x: 490, y: 30 });
  });

  it("translates screen coords to garden coords: short panel", () => {
    const result = translateScreenToGarden({
      mapTransformProps: fakeMapTransformProps(),
      page: { x: 520, y: 412 },
      scroll: { left: 10, top: 20 },
      zoomLvl: 1,
      gridOffset: { x: 30, y: 40 },
      panelStatus: MapPanelStatus.short,
    });
    expect(result).toEqual({ x: 490, y: 40 });
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
    const stepsPerMm: StepsPerMm = { x: undefined, y: undefined, z: undefined };
    const defaultLength: Record<Xyz, number> = { x: 3000, y: 1500, z: 400 };
    return {
      botMcuParams,
      stepsPerMm,
      defaultLength
    };
  }

  function expectDefaultSize(botSize: BotSize) {
    expect(botSize).toEqual({
      x: { value: 3000, isDefault: true },
      y: { value: 1500, isDefault: true },
      z: { value: 400, isDefault: true },
    });
  }

  it("returns default bed size: when settings undefined", () => {
    const p = fakeProps();
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMm, p.defaultLength);
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
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMm, p.defaultLength);
    expectDefaultSize(botSize);
  });

  it("returns default bed size: when axis length is default", () => {
    const p = fakeProps();
    p.botMcuParams = {
      movement_stop_at_max_x: 1,
      movement_stop_at_max_y: 1,
      movement_stop_at_max_z: 1,
      movement_axis_nr_steps_x: 0,
      movement_axis_nr_steps_y: 0,
      movement_axis_nr_steps_z: 0,
    };
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMm, p.defaultLength);
    expectDefaultSize(botSize);
  });

  it("returns default bed size: when steps per mm is 0", () => {
    const p = fakeProps();
    p.botMcuParams = {
      movement_stop_at_max_x: 1,
      movement_stop_at_max_y: 1,
      movement_stop_at_max_z: 1,
      movement_axis_nr_steps_x: 100,
      movement_axis_nr_steps_y: 100,
      movement_axis_nr_steps_z: 100,
    };
    p.stepsPerMm = { x: 0, y: 0, z: 0 };
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMm, p.defaultLength);
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
    p.stepsPerMm = { x: 5, y: 7, z: 25 };
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMm, p.defaultLength);
    expect(botSize).toEqual({
      x: { value: 100, isDefault: false },
      y: { value: 200, isDefault: false },
      z: { value: 400, isDefault: true },
    });
  });

  it("calculates correct bed size: one axis", () => {
    const p = fakeProps();
    p.botMcuParams = {
      movement_stop_at_max_x: 0,
      movement_stop_at_max_y: 1,
      movement_stop_at_max_z: 1,
      movement_axis_nr_steps_x: 500,
      movement_axis_nr_steps_y: 1400,
      movement_axis_nr_steps_z: 1400,
    };
    p.stepsPerMm = { x: 5, y: 7, z: 25 };
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMm, p.defaultLength);
    expect(botSize).toEqual({
      x: { value: 3000, isDefault: true },
      y: { value: 200, isDefault: false },
      z: { value: 56, isDefault: false },
    });
  });
});

describe("getMapSize()", () => {
  it("calculates grid size", () => {
    const gridSize = getMapSize(fakeMapTransformProps());
    expect(gridSize).toEqual({ h: 1500, w: 3000 });
  });

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

  it("calculates transformed coordinate: quadrant 0 (invalid)", () => {
    const original = { qx: 100, qy: 200 };
    const transformed = { qx: 100, qy: 200 };
    mapTransformProps.quadrant = 0 as BotOriginQuadrant;
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
    location.pathname = Path.mock(Path.cropSearch("mint/add"));
    expect(getMode()).toEqual(Mode.clickToAdd);
    location.pathname = Path.mock(Path.plants(1));
    expect(getMode()).toEqual(Mode.editPlant);
    location.pathname = Path.mock(Path.plantTemplates(1));
    expect(getMode()).toEqual(Mode.editPlant);
    location.pathname = Path.mock(Path.plants("select"));
    expect(getMode()).toEqual(Mode.boxSelect);
    location.pathname = Path.mock(Path.cropSearch("mint"));
    expect(getMode()).toEqual(Mode.clickToAdd);
    location.pathname = Path.mock(Path.location());
    expect(getMode()).toEqual(Mode.locationInfo);
    location.pathname = Path.mock(Path.points());
    expect(getMode()).toEqual(Mode.points);
    location.pathname = Path.mock(Path.points("add"));
    expect(getMode()).toEqual(Mode.createPoint);
    location.pathname = Path.mock(Path.weeds());
    expect(getMode()).toEqual(Mode.weeds);
    location.pathname = Path.mock(Path.weeds("add"));
    expect(getMode()).toEqual(Mode.createWeed);
    location.pathname = Path.mock(Path.savedGardens(1));
    expect(getMode()).toEqual(Mode.templateView);
    location.pathname = Path.mock(Path.groups(1));
    expect(getMode()).toEqual(Mode.editGroup);
    location.pathname = "";
    mockState.resources.consumers.farm_designer.profileOpen = true;
    expect(getMode()).toEqual(Mode.profile);
    mockState.resources.consumers.farm_designer.profileOpen = false;
    location.pathname = "";
    expect(getMode()).toEqual(Mode.none);
  });
});

describe("savedGardenOpen", () => {
  it("is open", () => {
    location.pathname = Path.mock(Path.savedGardens(4));
    const result = savedGardenOpen();
    expect(result).toEqual(4);
  });
});

describe("getGardenCoordinates()", () => {
  beforeEach(() => {
    Object.defineProperty(document, "querySelector", {
      value: () => ({ scrollLeft: 1, scrollTop: 2 }),
      configurable: true
    });
    Object.defineProperty(window, "getComputedStyle", {
      value: () => ({ transform: "scale(1)" }), configurable: true
    });
  });

  const fakeProps = (): GetGardenCoordinatesProps => ({
    mapTransformProps: fakeMapTransformProps(),
    gridOffset: { x: 10, y: 20 },
    pageX: 500,
    pageY: 200,
    designer: fakeDesignerState(),
  });

  it("returns garden coordinates", () => {
    const result = getGardenCoordinates(fakeProps());
    expect(result).toEqual({ x: 20, y: 90 });
  });

  it("falls back to zoom level", () => {
    Object.defineProperty(window, "getComputedStyle", {
      value: () => ({ transform: undefined }), configurable: true
    });
    const result = getGardenCoordinates(fakeProps());
    expect(result).toEqual({ x: 20, y: 90 });
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

describe("allowInteraction()", () => {
  it("allows interaction", () => {
    location.pathname = Path.mock(Path.plants());
    expect(allowInteraction()).toBeTruthy();
  });

  it("disallows interaction", () => {
    location.pathname = Path.mock(Path.cropSearch("mint/add"));
    expect(allowInteraction()).toBeFalsy();
    location.pathname = Path.mock(Path.location());
    expect(allowInteraction()).toBeFalsy();
    location.pathname = Path.mock(Path.points("add"));
    expect(allowInteraction()).toBeFalsy();
    location.pathname = Path.mock(Path.weeds("add"));
    expect(allowInteraction()).toBeFalsy();
  });
});

describe("allowGroupAreaInteraction()", () => {
  it("allows interaction", () => {
    location.pathname = Path.mock(Path.plants());
    expect(allowGroupAreaInteraction()).toBeTruthy();
  });

  it("disallows interaction", () => {
    location.pathname = Path.mock(Path.plants("select"));
    expect(allowGroupAreaInteraction()).toBeFalsy();
    location.pathname = Path.mock(Path.location());
    expect(allowGroupAreaInteraction()).toBeFalsy();
    location.pathname = Path.mock(Path.groups(1));
    expect(allowGroupAreaInteraction()).toBeFalsy();
  });
});

describe("cursorAtPlant()", () => {
  const plant = fakePlant();
  plant.body.radius = 25;
  plant.body.x = 100;
  plant.body.y = 200;

  const isAwayFromPlant = (cursor: { x: number, y: number } | undefined) =>
    expect(cursorAtPlant(plant, cursor)).toBeFalsy();

  const isAtPlant = (cursor: { x: number, y: number } | undefined) =>
    expect(cursorAtPlant(plant, cursor)).toBeTruthy();

  it("cursor is at the plant", () => {
    isAtPlant({ x: 100, y: 200 });
    isAtPlant({ x: 75, y: 175 });
    isAtPlant({ x: 125, y: 225 });
  });

  it("cursor is away from the plant", () => {
    isAwayFromPlant({ x: 140, y: 200 });
    isAwayFromPlant({ x: 60, y: 200 });
    isAwayFromPlant({ x: 100, y: 240 });
    isAwayFromPlant({ x: 100, y: 160 });
    isAwayFromPlant(undefined);
  });
});

describe("scaleIcon()", () => {
  it.each<[number, number]>([
    [0, 10],
    [10, 10],
    [13, 10],
    [14, 10],
    [37, 30],
    [38, 30],
    [150, 30],
    [151, 30],
    [250, 50],
  ])("returns correct value for radius: %s", (radius, expected) => {
    expect(scaleIcon(radius)).toEqual(expected);
  });
});

describe("defaultSpread()", () => {
  it.each<[number, number]>([
    [0, 25],
    [100, 25],
    [150, 30],
    [200, 40],
  ])("returns correct value for radius: %s", (radius, expected) => {
    expect(defaultSpreadCmDia(radius)).toEqual(expected);
  });
});
