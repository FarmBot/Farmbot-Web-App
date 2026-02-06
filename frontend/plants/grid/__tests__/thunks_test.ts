const mockSaveAllReturnValue = { mock: "yep" };
jest.mock("../../../api/crud", () => ({
  saveAll: jest.fn(() => mockSaveAllReturnValue),
}));

import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { fakeState } from "../../../__test_support__/fake_state";
import { saveAll } from "../../../api/crud";
import { Actions } from "../../../constants";
const GRID_ID = "1234567";
const PLANT = fakePlant();
PLANT.body.meta["gridId"] = GRID_ID;

afterAll(() => {
  jest.unmock("../../../api/crud");
});
describe("saveGrid", () => {
  it("saves a particular grid", () => {
    jest.unmock("../thunks");
    const { saveGrid } = jest.requireActual("../thunks");
    const thunk = saveGrid(GRID_ID);
    const dispatch = jest.fn();
    const state = fakeState();
    state.resources = buildResourceIndex([PLANT]);
    thunk(dispatch, jest.fn(() => state));
    expect(saveAll).toHaveBeenLastCalledWith([PLANT]);
    expect(dispatch).toHaveBeenCalledWith(mockSaveAllReturnValue);
  });
});

describe("stashGrid", () => {
  it("removes grids that the user doesn't want", () => {
    jest.unmock("../thunks");
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
});
