jest.mock("../../../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
  initSave: jest.fn(),
}));

jest.mock("../../../actions", () => ({
  movePoints: jest.fn(),
  movePointTo: jest.fn(),
}));

import { FAKE_CROPS } from "../../../../../__test_support__/fake_crops";
jest.mock("../../../../../crops/constants", () => ({
  CROPS: FAKE_CROPS,
}));

import {
  newPlantKindAndBody, NewPlantKindAndBodyProps,
  maybeSavePlantLocation, MaybeSavePlantLocationProps,
  beginPlantDrag, BeginPlantDragProps,
  setActiveSpread, SetActiveSpreadProps,
  dragPlant, DragPlantProps,
  createPlant, CreatePlantProps,
  dropPlant, DropPlantProps, jogPoints, JogPointsProps, savePoints, SavePointsProps,
} from "../plant_actions";
import {
  fakeCurve, fakePlant,
} from "../../../../../__test_support__/fake_state/resources";
import { edit, save, initSave } from "../../../../../api/crud";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import { movePointTo, movePoints } from "../../../actions";
import { error } from "../../../../../toast/toast";
import { BotOriginQuadrant } from "../../../../interfaces";
import {
  fakeDesignerState,
} from "../../../../../__test_support__/fake_designer_state";
import { Path } from "../../../../../internal_urls";

describe("newPlantKindAndBody()", () => {
  it("returns new PlantTemplate", () => {
    const p: NewPlantKindAndBodyProps = {
      x: 0,
      y: 0,
      slug: "mint",
      cropName: "Mint",
      openedSavedGarden: 1,
      depth: 0,
      designer: fakeDesignerState(),
    };
    const result = newPlantKindAndBody(p);
    expect(result).toEqual(expect.objectContaining({
      kind: "PlantTemplate"
    }));
  });
});

describe("createPlant()", () => {
  const fakeProps = (): CreatePlantProps => ({
    cropName: "Mint",
    slug: "mint",
    gardenCoords: { x: 10, y: 20 },
    gridSize: { x: 1000, y: 2000 },
    dispatch: jest.fn(),
    openedSavedGarden: undefined,
    depth: 0,
    designer: fakeDesignerState(),
  });

  it("creates plant", () => {
    createPlant(fakeProps());
    expect(initSave).toHaveBeenCalledWith("Point",
      expect.objectContaining({ name: "Mint", x: 10, y: 20 }));
  });

  it("doesn't create plant outside planting area", () => {
    const p = fakeProps();
    p.gardenCoords = { x: -100, y: -100 };
    createPlant(p);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("Outside of planting area"));
    expect(initSave).not.toHaveBeenCalled();
  });

  it("doesn't create generic plant", () => {
    const p = fakeProps();
    p.slug = "slug";
    createPlant(p);
    expect(initSave).not.toHaveBeenCalled();
  });
});

describe("dropPlant()", () => {
  beforeEach(() => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
  });

  const fakeProps = (): DropPlantProps => {
    const designer = fakeDesignerState();
    return {
      designer,
      gardenCoords: { x: 10, y: 20 },
      gridSize: { x: 1000, y: 2000 },
      dispatch: jest.fn(),
      getConfigValue: jest.fn(),
      curves: [],
    };
  };

  it("drops plant", () => {
    dropPlant(fakeProps());
    expect(initSave).toHaveBeenCalledWith("Point",
      expect.objectContaining({ name: "Mint", x: 10, y: 20 }));
  });

  it("drops companion plant", () => {
    const p = fakeProps();
    p.designer.companionIndex = 0;
    dropPlant(p);
    expect(initSave).toHaveBeenCalledWith("Point",
      expect.objectContaining({ name: "Strawberry", x: 10, y: 20 }));
  });

  it("doesn't drop plant", () => {
    console.log = jest.fn();
    location.pathname = Path.mock(Path.cropSearch()) + "/";
    dropPlant(fakeProps());
    expect(initSave).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("Missing slug.");
  });

  it("finds curves", () => {
    const p = fakeProps();
    const plant = fakePlant();
    plant.body.openfarm_slug = "mint";
    plant.body.water_curve_id = 1;
    plant.body.spread_curve_id = 2;
    plant.body.height_curve_id = 3;
    const wCurve = fakeCurve();
    wCurve.body.id = 1;
    wCurve.body.type = "water";
    const sCurve = fakeCurve();
    sCurve.body.id = 2;
    sCurve.body.type = "spread";
    const hCurve = fakeCurve();
    hCurve.body.id = 3;
    hCurve.body.type = "height";
    p.curves = [wCurve, sCurve, hCurve];
    p.designer.cropWaterCurveId = 1;
    p.designer.cropSpreadCurveId = 2;
    p.designer.cropHeightCurveId = 3;
    dropPlant(p);
    expect(initSave).toHaveBeenCalledWith("Point",
      expect.objectContaining({
        name: "Mint",
        x: 10, y: 20,
        water_curve_id: 1,
        spread_curve_id: 2,
        height_curve_id: 3,
      }));
  });

  it("doesn't find curves", () => {
    const p = fakeProps();
    p.curves = [];
    dropPlant(p);
    expect(initSave).toHaveBeenCalledWith("Point",
      expect.objectContaining({
        name: "Mint",
        x: 10, y: 20,
        water_curve_id: undefined,
        spread_curve_id: undefined,
        height_curve_id: undefined,
      }));
  });

  it("throws error", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p.gardenCoords = undefined as any;
    expect(() => dropPlant(p))
      .toThrow(/while trying to add a plant/);
  });
});

describe("dragPlant()", () => {
  beforeEach(function () {
    Object.defineProperty(document, "querySelector", {
      value: () => ({ scrollLeft: 1, scrollTop: 2 }),
      configurable: true
    });
    Object.defineProperty(window, "getComputedStyle", {
      value: () => ({ transform: "scale(1)" }), configurable: true
    });
  });

  const plant = fakePlant();

  const fakeProps = (): DragPlantProps => ({
    getPlant: () => plant,
    mapTransformProps: fakeMapTransformProps(),
    isDragging: true,
    dispatch: jest.fn(),
    setMapState: jest.fn(),
    gardenCoords: { x: 100, y: 200 },
  });

  it("moves plant", () => {
    const p = fakeProps();
    dragPlant(p);
    expect(p.setMapState).toHaveBeenCalledWith({
      activeDragXY: { x: 100, y: 200, z: 0 },
    });
    expect(movePointTo).toHaveBeenCalledWith({
      x: 100, y: 200, gridSize: p.mapTransformProps.gridSize,
      point: p.getPlant(),
    });
  });

  it("doesn't move plant: not dragging", () => {
    const p = fakeProps();
    p.isDragging = false;
    dragPlant(p);
    expect(p.setMapState).not.toHaveBeenCalled();
    expect(movePointTo).not.toHaveBeenCalled();
  });
});

describe("jogPoints()", () => {
  const fakeProps = (): JogPointsProps => ({
    keyName: "",
    points: [],
    mapTransformProps: fakeMapTransformProps(),
    dispatch: jest.fn(),
  });

  it("doesn't move point: no point", () => {
    const p = fakeProps();
    p.keyName = "ArrowLeft";
    p.points = [];
    jogPoints(p);
    expect(movePoints).not.toHaveBeenCalled();
  });

  it("doesn't move point: not arrow key", () => {
    const p = fakeProps();
    p.keyName = "Enter";
    p.points = [fakePlant()];
    jogPoints(p);
    expect(movePoints).not.toHaveBeenCalled();
  });

  it.each<[string, BotOriginQuadrant, boolean, number, number]>([
    ["ArrowLeft", 1, false, 10, 0],
    ["ArrowLeft", 1, true, 0, 10],
    ["ArrowLeft", 2, false, -10, 0],
    ["ArrowLeft", 2, true, 0, -10],
    ["ArrowLeft", 3, false, -10, 0],
    ["ArrowLeft", 3, true, 0, -10],
    ["ArrowLeft", 4, false, 10, 0],
    ["ArrowLeft", 4, true, 0, 10],
    ["ArrowRight", 1, false, -10, 0],
    ["ArrowRight", 1, true, 0, -10],
    ["ArrowRight", 2, false, 10, 0],
    ["ArrowRight", 2, true, 0, 10],
    ["ArrowRight", 3, false, 10, 0],
    ["ArrowRight", 3, true, 0, 10],
    ["ArrowRight", 4, false, -10, 0],
    ["ArrowRight", 4, true, 0, -10],
    ["ArrowDown", 1, false, 0, 10],
    ["ArrowDown", 1, true, 10, 0],
    ["ArrowDown", 2, false, 0, 10],
    ["ArrowDown", 2, true, 10, 0],
    ["ArrowDown", 3, false, 0, -10],
    ["ArrowDown", 3, true, -10, 0],
    ["ArrowDown", 4, false, 0, -10],
    ["ArrowDown", 4, true, -10, 0],
    ["ArrowUp", 1, false, 0, -10],
    ["ArrowUp", 1, true, -10, 0],
    ["ArrowUp", 2, false, 0, -10],
    ["ArrowUp", 2, true, -10, 0],
    ["ArrowUp", 3, false, 0, 10],
    ["ArrowUp", 3, true, 10, 0],
    ["ArrowUp", 4, false, 0, 10],
    ["ArrowUp", 4, true, 10, 0],
  ])("moves point: %s, quadrant: %s, rotated: %s",
    (keyName, quadrant, swap, x, y) => {
      const p = fakeProps();
      p.keyName = keyName;
      p.points = [fakePlant()];
      p.mapTransformProps.quadrant = quadrant;
      p.mapTransformProps.xySwap = swap;
      jogPoints(p);
      expect(movePoints).toHaveBeenCalledWith({
        deltaX: x,
        deltaY: y,
        points: p.points,
        gridSize: p.mapTransformProps.gridSize,
      });
    });
});

describe("setActiveSpread()", () => {
  const fakeProps = (): SetActiveSpreadProps => ({
    selectedPlant: fakePlant(),
    slug: "mint",
    setMapState: jest.fn(),
  });

  it("sets default spread value", async () => {
    const p = fakeProps();
    p.slug = "potato";
    await setActiveSpread(p);
    expect(p.setMapState).toHaveBeenCalledWith({ activeDragSpread: 25 });
  });

  it("sets crop spread value", async () => {
    const p = fakeProps();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p.selectedPlant = undefined as any;
    await setActiveSpread(p);
    expect(p.setMapState).toHaveBeenCalledWith({ activeDragSpread: 100 });
  });
});

describe("beginPlantDrag()", () => {
  const fakeProps = (): BeginPlantDragProps => ({
    plant: fakePlant(),
    setMapState: jest.fn(),
    selectedPlant: undefined,
  });

  it("starts drag: plant", () => {
    beginPlantDrag(fakeProps());
  });

  it("starts drag: not plant", () => {
    const p = fakeProps();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p.plant = undefined as any;
    beginPlantDrag(p);
  });
});

describe("maybeSavePlantLocation()", () => {
  const fakeProps = (): MaybeSavePlantLocationProps => ({
    plant: fakePlant(),
    isDragging: true,
    dispatch: jest.fn(),
  });

  it("saves location", () => {
    maybeSavePlantLocation(fakeProps());
    expect(edit).toHaveBeenCalledWith(expect.any(Object),
      { x: 100, y: 200 });
    expect(save).toHaveBeenCalledWith(expect.stringContaining("Point"));
  });

  it("doesn't save location", () => {
    const p = fakeProps();
    p.isDragging = false;
    maybeSavePlantLocation(p);
    expect(edit).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });
});

describe("savePoints()", () => {
  const fakeProps = (): SavePointsProps => ({
    dispatch: jest.fn(),
    points: [fakePlant()],
  });

  it("saves plant", () => {
    savePoints(fakeProps());
    expect(edit).not.toHaveBeenCalled();
    expect(save).toHaveBeenCalledWith(expect.stringContaining("Point"));
  });

  it("doesn't save plant", () => {
    const p = fakeProps();
    p.points = [];
    savePoints(p);
    expect(edit).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });
});
