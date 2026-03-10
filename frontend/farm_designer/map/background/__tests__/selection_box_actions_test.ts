import { Mode } from "../../interfaces";
let mockMode = Mode.none;

import {
  fakePlant, fakePointGroup,
} from "../../../../__test_support__/fake_state/resources";
import {
  getSelected, resizeBox, startNewSelectionBox, ResizeSelectionBoxProps,
  StartNewSelectionBoxProps,
  maybeUpdateGroup,
  MaybeUpdateGroupProps,
} from "../selection_box_actions";
import { Actions } from "../../../../constants";
import * as pointGroupCriteria from "../../../../point_groups/criteria";
import { cloneDeep } from "lodash";
import * as pointGroupActions from "../../../../point_groups/actions";
import { Path } from "../../../../internal_urls";
import * as mapUtil from "../../util";

let editGtLtCriteriaSpy: jest.SpyInstance;
let overwriteGroupSpy: jest.SpyInstance;

beforeEach(() => {
  jest.spyOn(mapUtil, "getMode").mockImplementation(() => mockMode);
  editGtLtCriteriaSpy = jest.spyOn(pointGroupCriteria, "editGtLtCriteria")
    .mockImplementation(jest.fn());
  overwriteGroupSpy = jest.spyOn(pointGroupActions, "overwriteGroup")
    .mockImplementation(jest.fn());
});

describe("getSelected", () => {
  it("returns some", () => {
    const result = getSelected(
      [fakePlant(), fakePlant()],
      { x0: 0, y0: 0, x1: 2000, y1: 2000 });
    expect(result).toEqual([
      expect.stringContaining("Point"),
      expect.stringContaining("Point"),
    ]);
  });

  it("returns none", () => {
    const result = getSelected(
      [fakePlant(), fakePlant()],
      undefined);
    expect(result).toEqual(undefined);
  });
});

describe("resizeBox", () => {
  beforeEach(() => {
    mockMode = Mode.boxSelect;
  });

  const fakeProps = (): ResizeSelectionBoxProps => ({
    selectionBox: { x0: 0, y0: 0, x1: undefined, y1: undefined },
    plants: [],
    allPoints: [],
    selectionPointType: undefined,
    getConfigValue: () => true,
    gardenCoords: { x: 100, y: 200 },
    setMapState: jest.fn(),
    dispatch: jest.fn(),
    plantActions: true,
    navigate: jest.fn(),
  });

  it("resizes selection box without point selection", () => {
    const p = fakeProps();
    resizeBox(p);
    expect(p.setMapState).toHaveBeenCalledWith({
      selectionBox: { x0: 0, y0: 0, x1: 100, y1: 200 }
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_POINT,
      payload: undefined
    });
  });

  it("resizes selection box without plant actions", () => {
    const p = fakeProps();
    p.plantActions = false;
    resizeBox(p);
    expect(p.setMapState).toHaveBeenCalledWith({
      selectionBox: { x0: 0, y0: 0, x1: 100, y1: 200 }
    });
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("doesn't resize box: no location", () => {
    const p = fakeProps();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p.gardenCoords = undefined as any;
    resizeBox(p);
    expect(p.setMapState).not.toHaveBeenCalled();
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("doesn't resize box: no box", () => {
    const p = fakeProps();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p.selectionBox = undefined as any;
    resizeBox(p);
    expect(p.setMapState).not.toHaveBeenCalled();
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("resizes selection box", () => {
    mockMode = Mode.none;
    const p = fakeProps();
    const plant = fakePlant();
    plant.body.x = 50;
    plant.body.y = 50;
    p.plants = [plant];
    resizeBox(p);
    expect(p.setMapState).toHaveBeenCalledWith({
      selectionBox: { x0: 0, y0: 0, x1: 100, y1: 200 }
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_POINT,
      payload: [plant.uuid]
    });
    expect(p.navigate).toHaveBeenCalledWith(Path.plants("select"));
  });
});

describe("startNewSelectionBox", () => {
  const fakeProps = (): StartNewSelectionBoxProps => ({
    gardenCoords: { x: 100, y: 200 },
    setMapState: jest.fn(),
    dispatch: jest.fn(),
    plantActions: true,
  });

  it("starts selection box", () => {
    const p = fakeProps();
    startNewSelectionBox(p);
    expect(p.setMapState).toHaveBeenCalledWith({
      selectionBox: { x0: 100, y0: 200, x1: undefined, y1: undefined }
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_POINT,
      payload: undefined
    });
  });

  it("starts selection box without plant actions", () => {
    const p = fakeProps();
    p.plantActions = false;
    startNewSelectionBox(p);
    expect(p.setMapState).toHaveBeenCalledWith({
      selectionBox: { x0: 100, y0: 200, x1: undefined, y1: undefined }
    });
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("doesn't start box", () => {
    const p = fakeProps();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p.gardenCoords = undefined as any;
    startNewSelectionBox(p);
    expect(p.setMapState).not.toHaveBeenCalled();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_POINT,
      payload: undefined
    });
  });
});

describe("maybeUpdateGroup()", () => {
  const fakeProps = (): MaybeUpdateGroupProps => ({
    selectionBox: { x0: 0, y0: 0, x1: undefined, y1: undefined },
    dispatch: jest.fn(),
    group: fakePointGroup(),
    editGroupAreaInMap: false,
    boxSelected: undefined,
  });

  it("updates group", () => {
    const p = fakeProps();
    p.editGroupAreaInMap = false;
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    p.boxSelected = [plant1.uuid, plant2.uuid];
    p.group && (p.group.body.point_ids = [plant1.body.id || 0]);
    maybeUpdateGroup(p);
    expect(editGtLtCriteriaSpy).not.toHaveBeenCalled();
    const expectedBody = cloneDeep(p.group?.body);
    expectedBody && (expectedBody.point_ids = [
      plant1.body.id || 0, plant2.body.id || 0,
    ]);
    expect(overwriteGroupSpy).toHaveBeenCalledWith(p.group, expectedBody);
  });

  it("doesn't update group", () => {
    const p = fakeProps();
    p.editGroupAreaInMap = false;
    p.boxSelected = undefined;
    maybeUpdateGroup(p);
    expect(editGtLtCriteriaSpy).not.toHaveBeenCalled();
    expect(overwriteGroupSpy).not.toHaveBeenCalled();
  });

  it("updates criteria", () => {
    const p = fakeProps();
    p.editGroupAreaInMap = true;
    maybeUpdateGroup(p);
    expect(editGtLtCriteriaSpy).toHaveBeenCalledWith(p.group, p.selectionBox);
  });

  it("handles missing group or box", () => {
    const p = fakeProps();
    p.group = undefined;
    p.selectionBox = undefined;
    maybeUpdateGroup(p);
    expect(p.dispatch).not.toHaveBeenCalled();
    expect(editGtLtCriteriaSpy).not.toHaveBeenCalled();
    expect(overwriteGroupSpy).not.toHaveBeenCalled();
  });
});
