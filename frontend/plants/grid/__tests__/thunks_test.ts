const mockSaveAllReturnValue = { mock: "yep" };

import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import {
  fakePlant, fakePlantTemplate,
} from "../../../__test_support__/fake_state/resources";
import { fakeState } from "../../../__test_support__/fake_state";
import { saveAll } from "../../../api/crud";
import * as crud from "../../../api/crud";
import { Actions } from "../../../constants";
const GRID_ID = "1234567";
const PLANT = fakePlant();
PLANT.body.meta["gridId"] = GRID_ID;
const PLANT_TEMPLATE = fakePlantTemplate();

let saveAllSpy: jest.SpyInstance;

beforeEach(() => {
  saveAllSpy = jest.spyOn(crud, "saveAll")
    .mockImplementation(jest.fn(() => mockSaveAllReturnValue) as never);
});

afterEach(() => {
  saveAllSpy.mockRestore();
});
describe("saveGrid", () => {
  it("saves a particular grid", () => {
    const { saveGrid } = jest.requireActual("../thunks");
    const thunk = saveGrid(GRID_ID);
    const dispatch = jest.fn();
    const state = fakeState();
    state.resources = buildResourceIndex([PLANT]);
    thunk(dispatch, jest.fn(() => state));
    expect(saveAll).toHaveBeenLastCalledWith(
      [PLANT], undefined, expect.any(Function));
    expect(dispatch).toHaveBeenCalledWith(mockSaveAllReturnValue);
  });

  it("saves exact resources and propagates failures", async () => {
    const saveError = new Error("save failed");
    saveAllSpy.mockImplementation(
      jest.fn((_resources, _onSuccess, onError) =>
        () => Promise.resolve().then(() => onError(saveError))) as never);
    const { saveGrid } = jest.requireActual("../thunks");
    const thunk = saveGrid(GRID_ID, [PLANT_TEMPLATE.uuid]);
    const dispatch: jest.Mock = jest.fn();
    dispatch.mockImplementation((action: unknown) =>
      typeof action == "function"
        ? (action as Function)(dispatch)
        : action);
    const state = fakeState();
    state.resources = buildResourceIndex([PLANT_TEMPLATE]);

    await expect(thunk(dispatch, jest.fn(() => state)))
      .rejects.toEqual(saveError);
    expect(saveAll).toHaveBeenCalledWith(
      [PLANT_TEMPLATE], undefined, expect.any(Function));
  });
});

describe("stashGrid", () => {
  it("removes grids that the user doesn't want", () => {
    const { stashGrid } = jest.requireActual("../thunks");
    const thunk = stashGrid(GRID_ID);
    const state = fakeState();
    state.resources = buildResourceIndex([PLANT]);
    const dispatch = jest.fn();
    thunk(dispatch, jest.fn(() => state));
    expect(dispatch).toHaveBeenLastCalledWith({
      type: Actions.BATCH_DESTROY_RESOURCE_OK,
      payload: [PLANT],
    });
  });

  it("removes exact saved-garden grid resources", () => {
    const { stashGrid } = jest.requireActual("../thunks");
    const thunk = stashGrid(GRID_ID, [PLANT_TEMPLATE.uuid]);
    const state = fakeState();
    state.resources = buildResourceIndex([PLANT_TEMPLATE]);
    const dispatch = jest.fn();
    thunk(dispatch, jest.fn(() => state));
    expect(dispatch).toHaveBeenLastCalledWith({
      type: Actions.BATCH_DESTROY_RESOURCE_OK,
      payload: [PLANT_TEMPLATE],
    });
  });
});
