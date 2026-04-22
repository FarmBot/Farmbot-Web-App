import type {
  NewPlantKindAndBodyProps,
  MaybeSavePlantLocationProps,
  BeginPlantDragProps,
  SetActiveSpreadProps,
  DragPlantProps,
  CreatePlantProps,
  DropPlantProps, JogPointsProps, SavePointsProps,
} from "../plant_actions";
import {
  fakeCurve, fakePlant,
} from "../../../../../__test_support__/fake_state/resources";
import * as crud from "../../../../../api/crud";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import * as mapActions from "../../../actions";
import { error } from "../../../../../toast/toast";
import { BotOriginQuadrant } from "../../../../interfaces";
import {
  fakeDesignerState,
} from "../../../../../__test_support__/fake_designer_state";
import { Path } from "../../../../../internal_urls";
const plantActions = () =>
  jest.requireActual("../plant_actions");

let movePointsSpy: jest.SpyInstance;
let movePointToSpy: jest.SpyInstance;
let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
let initSaveSpy: jest.SpyInstance;
const originalDocumentQuerySelector = document.querySelector.bind(document);
const originalGetComputedStyle = window.getComputedStyle.bind(window);
const originalPathname = location.pathname;

beforeEach(() => {
  movePointsSpy = jest.spyOn(mapActions, "movePoints")
    .mockImplementation(jest.fn());
  movePointToSpy = jest.spyOn(mapActions, "movePointTo")
    .mockImplementation(jest.fn());
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
  initSaveSpy = jest.spyOn(crud, "initSave").mockImplementation(jest.fn());
});

afterEach(() => {
  movePointsSpy.mockRestore();
  movePointToSpy.mockRestore();
  editSpy.mockRestore();
  saveSpy.mockRestore();
  initSaveSpy.mockRestore();
  Object.defineProperty(document, "querySelector", {
    value: originalDocumentQuerySelector,
    configurable: true,
  });
  Object.defineProperty(window, "getComputedStyle", {
    value: originalGetComputedStyle,
    configurable: true,
  });
  location.pathname = originalPathname;
});

describe("plantActions().newPlantKindAndBody()", () => {
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
    const result = plantActions().newPlantKindAndBody(p);
    expect(result).toEqual(expect.objectContaining({
      kind: "PlantTemplate"
    }));
  });
});

describe("plantActions().createPlant()", () => {
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
    plantActions().createPlant(fakeProps());
    expect(crud.initSave).toHaveBeenCalledWith("Point",
      expect.objectContaining({ name: "Mint", x: 10, y: 20 }));
  });

  it("doesn't create plant outside planting area", () => {
    const p = fakeProps();
    p.gardenCoords = { x: -100, y: -100 };
    plantActions().createPlant(p);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("Outside of planting area"));
    expect(crud.initSave).not.toHaveBeenCalled();
  });

  it("doesn't create generic plant", () => {
    const p = fakeProps();
    p.slug = "slug";
    plantActions().createPlant(p);
    expect(crud.initSave).not.toHaveBeenCalled();
  });
});

describe("plantActions().dropPlant()", () => {
  let originalConsoleLog: typeof console.log;
  let getCropSlugSpy: jest.SpyInstance;

  beforeEach(() => {
    originalConsoleLog = console.log;
    getCropSlugSpy = jest.spyOn(Path, "getCropSlug")
      .mockImplementation(() => "mint");
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    getCropSlugSpy.mockRestore();
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
    plantActions().dropPlant(fakeProps());
    expect(crud.initSave).toHaveBeenCalledWith("Point",
      expect.objectContaining({ name: "Mint", x: 10, y: 20 }));
  });

  it("drops companion plant", () => {
    const p = fakeProps();
    p.designer.companionIndex = 0;
    plantActions().dropPlant(p);
    expect(crud.initSave).toHaveBeenCalledWith("Point",
      expect.objectContaining({ x: 10, y: 20 }));
  });

  it("doesn't drop plant", () => {
    console.log = jest.fn();
    getCropSlugSpy.mockImplementation(() => "");
    plantActions().dropPlant(fakeProps());
    expect(crud.initSave).not.toHaveBeenCalled();
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
    plantActions().dropPlant(p);
    expect(crud.initSave).toHaveBeenCalledWith("Point",
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
    plantActions().dropPlant(p);
    expect(crud.initSave).toHaveBeenCalledWith("Point",
      expect.objectContaining({
        name: "Mint",
        x: 10, y: 20,
        water_curve_id: undefined,
        spread_curve_id: undefined,
        height_curve_id: undefined,
      }));
  });

  it("throws error", () => {
    const p = fakeProps();
    p.gardenCoords = undefined;
    expect(() => plantActions().dropPlant(p))
      .toThrow(/while trying to add a plant/);
  });
});

describe("plantActions().dragPlant()", () => {
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
    plantActions().dragPlant(p);
    expect(p.setMapState).toHaveBeenCalledWith({
      activeDragXY: { x: 100, y: 200, z: 0 },
    });
    expect(mapActions.movePointTo).toHaveBeenCalledWith({
      x: 100, y: 200, gridSize: p.mapTransformProps.gridSize,
      point: p.getPlant(),
    });
  });

  it("doesn't move plant: not dragging", () => {
    const p = fakeProps();
    p.isDragging = false;
    plantActions().dragPlant(p);
    expect(p.setMapState).not.toHaveBeenCalled();
    expect(mapActions.movePointTo).not.toHaveBeenCalled();
  });
});

describe("plantActions().jogPoints()", () => {
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
    plantActions().jogPoints(p);
    expect(mapActions.movePoints).not.toHaveBeenCalled();
  });

  it("doesn't move point: not arrow key", () => {
    const p = fakeProps();
    p.keyName = "Enter";
    p.points = [fakePlant()];
    plantActions().jogPoints(p);
    expect(mapActions.movePoints).not.toHaveBeenCalled();
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
      plantActions().jogPoints(p);
      expect(mapActions.movePoints).toHaveBeenCalledWith({
        deltaX: x,
        deltaY: y,
        points: p.points,
        gridSize: p.mapTransformProps.gridSize,
      });
    });
});

describe("plantActions().setActiveSpread()", () => {
  const fakeProps = (): SetActiveSpreadProps => ({
    selectedPlant: fakePlant(),
    slug: "mint",
    setMapState: jest.fn(),
  });

  it("sets default spread value", async () => {
    const p = fakeProps();
    p.slug = "potato";
    await plantActions().setActiveSpread(p);
    expect(p.setMapState).toHaveBeenCalledWith({ activeDragSpread: 25 });
  });

  it("sets crop spread value", async () => {
    const p = fakeProps();
    p.selectedPlant = undefined;
    await plantActions().setActiveSpread(p);
    expect(p.setMapState).toHaveBeenCalledWith({ activeDragSpread: 75 });
  });
});

describe("plantActions().beginPlantDrag()", () => {
  const fakeProps = (): BeginPlantDragProps => ({
    plant: fakePlant(),
    setMapState: jest.fn(),
    selectedPlant: undefined,
  });

  it("starts drag: plant", () => {
    plantActions().beginPlantDrag(fakeProps());
  });

  it("starts drag: not plant", () => {
    const p = fakeProps();
    p.plant = undefined;
    plantActions().beginPlantDrag(p);
  });
});

describe("plantActions().maybeSavePlantLocation()", () => {
  const fakeProps = (): MaybeSavePlantLocationProps => ({
    plant: fakePlant(),
    isDragging: true,
    dispatch: jest.fn(),
  });

  it("saves location", () => {
    plantActions().maybeSavePlantLocation(fakeProps());
    expect(crud.edit).toHaveBeenCalledWith(expect.any(Object),
      { x: 100, y: 200 });
    expect(crud.save).toHaveBeenCalledWith(expect.stringContaining("Point"));
  });

  it("doesn't save location", () => {
    const p = fakeProps();
    p.isDragging = false;
    plantActions().maybeSavePlantLocation(p);
    expect(crud.edit).not.toHaveBeenCalled();
    expect(crud.save).not.toHaveBeenCalled();
  });
});

describe("plantActions().savePoints()", () => {
  const fakeProps = (): SavePointsProps => ({
    dispatch: jest.fn(),
    points: [fakePlant()],
  });

  it("saves plant", () => {
    plantActions().savePoints(fakeProps());
    expect(crud.edit).not.toHaveBeenCalled();
    expect(crud.save).toHaveBeenCalledWith(expect.stringContaining("Point"));
  });

  it("doesn't save plant", () => {
    const p = fakeProps();
    p.points = [];
    plantActions().savePoints(p);
    expect(crud.edit).not.toHaveBeenCalled();
    expect(crud.save).not.toHaveBeenCalled();
  });
});
