import type { DropPlant3DProps } from "../plant_actions";
import * as crud from "../../api/crud";
import { Actions } from "../../constants";
import {
  fakeDesignerState,
} from "../../__test_support__/fake_designer_state";
import { Path } from "../../internal_urls";
import { NumericSetting } from "../../session_keys";
import { error } from "../../toast/toast";

const plantActions = () =>
  jest.requireActual<typeof import("../plant_actions")>("../plant_actions");

describe("dropPlant3D()", () => {
  let initSaveSpy: jest.SpyInstance;
  let getCropSlugSpy: jest.SpyInstance;
  let originalConsoleLog: typeof console.log;

  beforeEach(() => {
    initSaveSpy = jest.spyOn(crud, "initSave").mockImplementation(jest.fn());
    getCropSlugSpy = jest.spyOn(Path, "getCropSlug")
      .mockImplementation(() => "mint");
    originalConsoleLog = console.log;
    console.log = jest.fn();
  });

  afterEach(() => {
    initSaveSpy.mockRestore();
    getCropSlugSpy.mockRestore();
    console.log = originalConsoleLog;
  });

  const fakeProps = (): DropPlant3DProps => ({
    gardenCoords: { x: 10, y: 20 },
    gridSize: { x: 1000, y: 2000 },
    dispatch: jest.fn(),
    getConfigValue: jest.fn(key =>
      key == NumericSetting.default_plant_depth ? 25 : undefined),
    designer: fakeDesignerState(),
  });

  it("drops a plant", () => {
    const p = fakeProps();
    p.designer.cropRadius = 123;
    p.designer.cropStage = "planted";

    plantActions().dropPlant3D(p);

    expect(crud.initSave).toHaveBeenCalledWith("Point",
      expect.objectContaining({
        name: "Mint",
        x: 10,
        y: 20,
        radius: 123,
        depth: 25,
        plant_stage: "planted",
      }));
    expect(p.dispatch).toHaveBeenLastCalledWith({
      type: Actions.SET_COMPANION_INDEX,
      payload: undefined,
    });
  });

  it("drops a plant template for saved gardens", () => {
    const p = fakeProps();
    p.designer.openedSavedGarden = 42;

    plantActions().dropPlant3D(p);

    expect(crud.initSave).toHaveBeenCalledWith("PlantTemplate",
      expect.objectContaining({
        x: 10,
        y: 20,
        saved_garden_id: 42,
      }));
  });

  it("drops a companion plant", () => {
    const p = fakeProps();
    p.designer.companionIndex = 0;

    plantActions().dropPlant3D(p);

    expect(crud.initSave).toHaveBeenCalledWith("Point",
      expect.objectContaining({
        openfarm_slug: "green-zebra-tomato",
      }));
  });

  it("doesn't drop a plant outside the planting area", () => {
    const p = fakeProps();
    p.gardenCoords = { x: -1, y: 20 };

    plantActions().dropPlant3D(p);

    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("Outside of planting area"));
    expect(crud.initSave).not.toHaveBeenCalled();
  });

  it("doesn't drop without a crop slug", () => {
    getCropSlugSpy.mockImplementation(() => "");

    plantActions().dropPlant3D(fakeProps());

    expect(crud.initSave).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith("Missing slug.");
  });

  it("throws without garden coordinates", () => {
    const p = fakeProps();
    p.gardenCoords = undefined;

    expect(() => plantActions().dropPlant3D(p))
      .toThrow(/while trying to add a plant/);
  });
});
