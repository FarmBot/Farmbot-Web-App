jest.mock("../point_groups/group_detail", () => ({
  fetchGroupFromUrl: jest.fn(() => mockGroup)
}));

jest.mock("../../api/crud", () => ({
  overwrite: jest.fn(),
  edit: jest.fn(),
}));

let mockMode = "none";
jest.mock("../map/util", () => ({ getMode: jest.fn(() => mockMode) }));

import {
  fakePlant, fakePointGroup
} from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";
import { GetState } from "../../redux/interfaces";
import { clickMapPlant, selectPlant, toggleHoveredPlant } from "../actions";
import {
  buildResourceIndex
} from "../../__test_support__/resource_index_builder";
import { overwrite } from "../../api/crud";

const mockGroup = fakePointGroup();

describe("clickMapPlant", () => {
  // Base case
  it("selects plants and toggles hovered plant", () => {
    const state = fakeState();
    const dispatch = jest.fn();
    const getState: GetState = jest.fn(() => state);
    clickMapPlant("foo", "bar")(dispatch, getState);
    expect(dispatch).toHaveBeenCalledWith(selectPlant(["foo"]));
    expect(dispatch).toHaveBeenCalledWith(toggleHoveredPlant("foo", "bar"));
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it("adds a point to current group if group editor is active", () => {
    mockMode = "addPointToGroup";
    const state = fakeState();
    const plant = fakePlant();
    plant.body.id = 23;
    state.resources = buildResourceIndex([plant]);
    const dispatch = jest.fn();
    const getState: GetState = jest.fn(() => state);
    clickMapPlant(plant.uuid, "bar")(dispatch, getState);
    expect(dispatch).toHaveBeenCalledWith(selectPlant([plant.uuid]));
    expect(dispatch).toHaveBeenCalledWith(toggleHoveredPlant(plant.uuid, "bar"));
    const xp =
      expect.objectContaining({ name: "Fake", point_ids: [23] });
    expect(overwrite).toHaveBeenCalledWith(mockGroup, xp);
    expect(dispatch).toHaveBeenCalledTimes(3);
  });
});
