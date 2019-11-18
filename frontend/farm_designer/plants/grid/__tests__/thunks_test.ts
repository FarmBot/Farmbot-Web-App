const mockSaveAllReturnValue = { mock: "yep" };

jest.mock("../../../../api/crud", () => {
  return {
    // Thunks are hard to test.
    saveAll: jest.fn(() => mockSaveAllReturnValue)
  };
});

import { saveGrid } from "../thunks";
import { buildResourceIndex } from "../../../../__test_support__/resource_index_builder";
import { fakePlant } from "../../../../__test_support__/fake_state/resources";
import { fakeState } from "../../../../__test_support__/fake_state";
import { saveAll } from "../../../../api/crud";

const GRID_ID = "1234567";
const PLANT = fakePlant();
PLANT.body.meta["gridId"] = GRID_ID;

const fakeResourceIndex = () => buildResourceIndex([PLANT]);

describe("saveGrid", () => {
  it("saves a particular grid", () => {
    const thunk = saveGrid(GRID_ID);
    const state = fakeState();
    const dispatch = jest.fn();
    state.resources = fakeResourceIndex();
    thunk(dispatch, jest.fn(() => state));
    expect(saveAll).toHaveBeenLastCalledWith([PLANT]);
    expect(dispatch).toHaveBeenCalledWith(mockSaveAllReturnValue);
  });
});

// describe("stashGrid", () => {
// });
