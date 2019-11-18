const mockSaveAllReturnValue = { mock: "yep" };

jest.mock("../../../../api/crud", () => {
  return {
    // Thunks are hard to test.
    saveAll: jest.fn(() => mockSaveAllReturnValue),
    destroy: jest.fn()
  };
});

import { saveGrid, stashGrid } from "../thunks";
import { buildResourceIndex } from "../../../../__test_support__/resource_index_builder";
import { fakePlant } from "../../../../__test_support__/fake_state/resources";
import { fakeState } from "../../../../__test_support__/fake_state";
import { saveAll, destroy } from "../../../../api/crud";

const GRID_ID = "1234567";
const PLANT = fakePlant();
PLANT.body.meta["gridId"] = GRID_ID;

const fakeResourceIndex = () => {
  const state = fakeState();
  state.resources = buildResourceIndex([PLANT]);
  return state;
}

describe("saveGrid", () => {
  it("saves a particular grid", () => {
    const thunk = saveGrid(GRID_ID);
    const dispatch = jest.fn();
    const state = fakeResourceIndex();
    thunk(dispatch, jest.fn(() => state));
    expect(saveAll).toHaveBeenLastCalledWith([PLANT]);
    expect(dispatch).toHaveBeenCalledWith(mockSaveAllReturnValue);
  });
});

describe("stashGrid", () => {
  it("removes grids that the user doesn't want", () => {
    const thunk = stashGrid(GRID_ID);
    const state = fakeResourceIndex();
    thunk(jest.fn, jest.fn(() => state));
    expect(destroy).toHaveBeenLastCalledWith(PLANT.uuid, true);
  });
});
