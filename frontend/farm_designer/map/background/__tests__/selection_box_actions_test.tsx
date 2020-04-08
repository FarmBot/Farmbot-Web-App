import { Mode } from "../../interfaces";
let mockMode = Mode.none;
jest.mock("../../util", () => ({ getMode: () => mockMode }));

jest.mock("../../../../history", () => ({ history: { push: jest.fn() } }));

jest.mock("../../../point_groups/criteria", () => ({
  editGtLtCriteria: jest.fn(),
}));

jest.mock("../../../../api/crud", () => ({
  overwrite: jest.fn(),
  save: jest.fn(),
}));

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
import { history } from "../../../../history";
import { editGtLtCriteria } from "../../../point_groups/criteria";
import { overwrite, save } from "../../../../api/crud";
import { cloneDeep } from "lodash";

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
  });

  it("resizes selection box", () => {
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
    // tslint:disable-next-line:no-any
    p.gardenCoords = undefined as any;
    resizeBox(p);
    expect(p.setMapState).not.toHaveBeenCalled();
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("doesn't resize box: no box", () => {
    const p = fakeProps();
    // tslint:disable-next-line:no-any
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
    expect(history.push).toHaveBeenCalledWith("/app/designer/plants/select");
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
    // tslint:disable-next-line:no-any
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
    shouldDisplay: () => true,
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
    expect(editGtLtCriteria).not.toHaveBeenCalled();
    const expectedBody = cloneDeep(p.group?.body);
    expectedBody && (expectedBody.point_ids = [
      plant1.body.id || 0, plant2.body.id || 0,
    ]);
    expect(overwrite).toHaveBeenCalledWith(p.group, expectedBody);
    expect(save).not.toHaveBeenCalled();
  });

  it("updates criteria", () => {
    const p = fakeProps();
    p.editGroupAreaInMap = true;
    maybeUpdateGroup(p);
    expect(editGtLtCriteria).toHaveBeenCalledWith(p.group, p.selectionBox);
  });

  it("doesn't update criteria", () => {
    const p = fakeProps();
    p.shouldDisplay = () => false;
    maybeUpdateGroup(p);
    expect(editGtLtCriteria).not.toHaveBeenCalled();
  });

  it("handles missing group or box", () => {
    const p = fakeProps();
    p.group = undefined;
    p.selectionBox = undefined;
    maybeUpdateGroup(p);
    expect(p.dispatch).not.toHaveBeenCalled();
    expect(editGtLtCriteria).not.toHaveBeenCalled();
    expect(overwrite).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });
});
