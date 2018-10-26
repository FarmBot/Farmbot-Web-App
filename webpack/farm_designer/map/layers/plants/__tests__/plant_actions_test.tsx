jest.mock("../../../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
  initSave: jest.fn(),
}));

const mockSpreads: { [x: string]: number } = { mint: 100 };
jest.mock("../../../../../open_farm/icons", () => ({
  cachedCrop: jest.fn(p => Promise.resolve({ spread: mockSpreads[p] })),
}));

jest.mock("../../../../actions", () => ({
  movePlant: jest.fn(),
}));

jest.mock("../../../../../history", () => ({
  getPathArray: () =>
    "/app/designer/plants/crop_search/mint".split("/"),
}));

import {
  newPlant, maybeSavePlantLocation, beginPlantDrag, setActiveSpread,
  dragPlant, createPlant, dropPlant
} from "../plant_actions";
import { fakePlant } from "../../../../../__test_support__/fake_state/resources";
import { edit, save, initSave } from "../../../../../api/crud";
import { cachedCrop } from "../../../../../open_farm/icons";
import {
  fakeMapTransformProps
} from "../../../../../__test_support__/map_transform_props";
import { movePlant } from "../../../../actions";
import { error } from "farmbot-toastr";

describe("newPlant()", () => {
  it("returns new PlantTemplate", () => {
    const result = newPlant({
      x: 0,
      y: 0,
      slug: "mint",
      cropName: "Mint",
      openedSavedGarden: "SavedGarden.1.1"
    });
    expect(result).toEqual(expect.objectContaining({
      kind: "PlantTemplate"
    }));
  });
});

describe("createPlant", () => {
  const fakeProps = () => ({
    cropName: "Mint",
    slug: "mint",
    gardenCoords: { x: 10, y: 20 },
    gridSize: { x: 1000, y: 2000 },
    dispatch: jest.fn(),
    openedSavedGarden: undefined,
  });

  it("creates plant", () => {
    createPlant(fakeProps());
    expect(initSave).toHaveBeenCalledWith(expect.objectContaining({
      body: expect.objectContaining({ name: "Mint", x: 10, y: 20 })
    }));
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

describe("dropPlant", () => {
  const fakeProps = () => ({
    gardenCoords: { x: 10, y: 20 },
    cropSearchResults: [{
      crop: {
        name: "Mint",
        slug: "mint",
        binomial_name: "",
        common_names: [],
        description: "",
        sun_requirements: "",
        sowing_method: "",
        processing_pictures: 0
      }, image: ""
    }],
    openedSavedGarden: undefined,
    gridSize: { x: 1000, y: 2000 },
    dispatch: jest.fn(),
  });

  it("drops plant", () => {
    dropPlant(fakeProps());
    expect(initSave).toHaveBeenCalledWith(expect.objectContaining({
      body: expect.objectContaining({ name: "Mint", x: 10, y: 20 })
    }));
  });

  it("throws error", () => {
    const p = fakeProps();
    // tslint:disable-next-line:no-any
    p.gardenCoords = undefined as any;
    expect(() => dropPlant(p))
      .toThrowError(/while trying to add a plant/);
  });
});

describe("dragPlant", () => {
  beforeEach(function () {
    Object.defineProperty(document, "querySelector", {
      value: () => { return { scrollLeft: 1, scrollTop: 2 }; },
      configurable: true
    });
    Object.defineProperty(window, "getComputedStyle", {
      value: () => { return { zoom: 1 }; }, configurable: true
    });
  });

  const plant = fakePlant();

  const fakeProps = () => ({
    getPlant: () => plant,
    mapTransformProps: fakeMapTransformProps(),
    isDragging: true,
    dispatch: jest.fn(),
    setMapState: jest.fn(),
    gridSize: { x: 1000, y: 2000 },
    pageX: 100,
    pageY: 200,
    qPageX: 10,
    qPageY: 20,
  });

  it("moves plant", () => {
    const p = fakeProps();
    dragPlant(p);
    expect(p.setMapState).toHaveBeenCalledWith({
      activeDragXY: { x: 190, y: 380, z: 0 },
      qPageX: 100, qPageY: 200
    });
    expect(movePlant).toHaveBeenCalledWith({
      deltaX: 90, deltaY: 180, gridSize: p.gridSize,
      plant: p.getPlant()
    });
  });

  it("moves plant while swapped in odd quadrant", () => {
    Object.defineProperty(window, "getComputedStyle", {
      value: () => { return { zoom: 0.5 }; }, configurable: true
    });
    const p = fakeProps();
    p.mapTransformProps.quadrant = 3;
    p.mapTransformProps.xySwap = true;
    p.qPageX = 500;
    p.qPageY = 3000;
    dragPlant(p);
    expect(p.setMapState).toHaveBeenCalledWith({
      activeDragXY: { x: 700, y: 400, z: 0 },
      qPageX: 200, qPageY: 2900
    });
    expect(movePlant).toHaveBeenCalledWith({
      deltaX: 600, deltaY: 200, gridSize: p.gridSize,
      plant: p.getPlant()
    });
  });

  it("moves plant: zoom unknown", () => {
    Object.defineProperty(window, "getComputedStyle", {
      value: () => { return { zoom: undefined }; }, configurable: true
    });
    const p = fakeProps();
    dragPlant(p);
    expect(p.setMapState).toHaveBeenCalledWith({
      activeDragXY: { x: 190, y: 380, z: 0 },
      qPageX: 100, qPageY: 200
    });
    expect(movePlant).toHaveBeenCalledWith({
      deltaX: 90, deltaY: 180, gridSize: p.gridSize,
      plant: p.getPlant()
    });
  });

  it("doesn't move plant: not dragging", () => {
    const p = fakeProps();
    p.isDragging = false;
    dragPlant(p);
    expect(p.setMapState).not.toHaveBeenCalled();
    expect(movePlant).not.toHaveBeenCalled();
  });

  it("moves plant: same location", () => {
    const p = fakeProps();
    // tslint:disable-next-line:no-any
    p.qPageX = undefined as any;
    // tslint:disable-next-line:no-any
    p.qPageY = undefined as any;
    dragPlant(p);
    expect(p.setMapState).toHaveBeenCalledWith({
      activeDragXY: { x: 100, y: 200, z: 0 },
      qPageX: 100, qPageY: 200
    });
    expect(movePlant).toHaveBeenCalledWith({
      deltaX: 0, deltaY: 0, gridSize: p.gridSize,
      plant: p.getPlant()
    });
  });
});

describe("setActiveSpread", () => {
  const fakeProps = () => ({
    selectedPlant: fakePlant(),
    slug: "mint",
    setMapState: jest.fn(),
  });

  it("sets default spread value", async () => {
    const p = fakeProps();
    p.slug = "potato";
    await setActiveSpread(p);
    expect(p.setMapState).toHaveBeenCalledWith({ activeDragSpread: 250 });
  });

  it("sets crop spread value", async () => {
    const p = fakeProps();
    // tslint:disable-next-line:no-any
    p.selectedPlant = undefined as any;
    await setActiveSpread(p);
    expect(p.setMapState).toHaveBeenCalledWith({ activeDragSpread: 1000 });
  });
});

describe("beginPlantDrag", () => {
  const fakeProps = () => ({
    plant: fakePlant(),
    setMapState: jest.fn(),
    selectedPlant: undefined,
  });

  it("starts drag: plant", () => {
    beginPlantDrag(fakeProps());
    expect(cachedCrop).toHaveBeenCalled();
  });

  it("starts drag: not plant", () => {
    const p = fakeProps();
    // tslint:disable-next-line:no-any
    p.plant = undefined as any;
    beginPlantDrag(p);
    expect(cachedCrop).not.toHaveBeenCalled();
  });
});

describe("maybeSavePlantLocation", () => {
  const fakeProps = () => ({
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
