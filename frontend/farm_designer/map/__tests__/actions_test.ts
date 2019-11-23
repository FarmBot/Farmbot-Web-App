let mockPath = "/app/designer/plants";
jest.mock("../../../history", () => ({
  history: { push: jest.fn() },
  getPathArray: jest.fn(() => { return mockPath.split("/"); })
}));

jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  overwrite: jest.fn(),
}));

import { fakePointGroup } from "../../../__test_support__/fake_state/resources";
const mockGroup = fakePointGroup();
jest.mock("../../point_groups/group_detail", () => ({
  fetchGroupFromUrl: jest.fn(() => mockGroup)
}));

import {
  movePlant, closePlantInfo, setDragIcon, clickMapPlant, selectPlant,
  setHoveredPlant
} from "../actions";
import { MovePlantProps } from "../../interfaces";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { edit, overwrite } from "../../../api/crud";
import { Actions } from "../../../constants";
import { DEFAULT_ICON, svgToUrl } from "../../../open_farm/icons";
import { history } from "../../../history";
import { fakeState } from "../../../__test_support__/fake_state";
import { GetState } from "../../../redux/interfaces";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";

describe("movePlant", () => {
  function movePlantTest(
    caseDescription: string,
    attempted: { x: number, y: number },
    expected: { x: number, y: number }) {
    it(`restricts plant to grid area: ${caseDescription}`, () => {
      const payload: MovePlantProps = {
        deltaX: attempted.x,
        deltaY: attempted.y,
        plant: fakePlant(),
        gridSize: { x: 3000, y: 1500 }
      };
      movePlant(payload);
      expect(edit).toHaveBeenCalledWith(
        // Old plant
        expect.objectContaining({
          body: expect.objectContaining({
            x: 100, y: 200
          })
        }),
        // Update
        expect.objectContaining({
          x: expected.x, y: expected.y
        })
      );
    });
  }
  movePlantTest("within bounds", { x: 1, y: 2 }, { x: 101, y: 202 });
  movePlantTest("too high", { x: 10000, y: 10000 }, { x: 3000, y: 1500 });
  movePlantTest("too low", { x: -10000, y: -10000 }, { x: 0, y: 0 });
});

describe("closePlantInfo()", () => {
  it("no plant info open", () => {
    mockPath = "/app/designer/plants";
    const dispatch = jest.fn();
    closePlantInfo(dispatch)();
    expect(history.push).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("plant edit open", () => {
    mockPath = "/app/designer/plants/1";
    const dispatch = jest.fn();
    closePlantInfo(dispatch)();
    expect(history.push).toHaveBeenCalledWith("/app/designer/plants");
    expect(dispatch).toHaveBeenCalledWith({
      payload: undefined, type: Actions.SELECT_PLANT
    });
  });

  it("plant info open", () => {
    mockPath = "/app/designer/plants/1";
    const dispatch = jest.fn();
    closePlantInfo(dispatch)();
    expect(history.push).toHaveBeenCalledWith("/app/designer/plants");
    expect(dispatch).toHaveBeenCalledWith({
      payload: undefined, type: Actions.SELECT_PLANT
    });
  });
});

describe("setDragIcon()", () => {
  it("sets the drag icon", () => {
    const setDragImage = jest.fn();
    const e = { currentTarget: new Image(), dataTransfer: { setDragImage } };
    setDragIcon("icon")(e);
    const img = new Image();
    img.src = svgToUrl("icon");
    expect(setDragImage).toHaveBeenCalledWith(img, 0, 0);
  });

  it("sets a default drag icon", () => {
    const setDragImage = jest.fn();
    const e = { currentTarget: new Image(), dataTransfer: { setDragImage } };
    setDragIcon(undefined)(e);
    const img = new Image();
    img.src = DEFAULT_ICON;
    expect(setDragImage).toHaveBeenCalledWith(img, 0, 0);
  });
});

describe("clickMapPlant", () => {
  it("selects plants and toggles hovered plant", () => {
    const state = fakeState();
    const dispatch = jest.fn();
    const getState: GetState = jest.fn(() => state);
    clickMapPlant("foo", "bar")(dispatch, getState);
    expect(dispatch).toHaveBeenCalledWith(selectPlant(["foo"]));
    expect(dispatch).toHaveBeenCalledWith(setHoveredPlant("foo", "bar"));
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it("adds a point to current group if group editor is active", () => {
    mockPath = "/app/designer/groups/1";
    mockGroup.body.point_ids = [1];
    const state = fakeState();
    const plant = fakePlant();
    plant.body.id = 23;
    state.resources = buildResourceIndex([plant]);
    const dispatch = jest.fn();
    const getState: GetState = jest.fn(() => state);
    clickMapPlant(plant.uuid, "bar")(dispatch, getState);
    expect(overwrite).toHaveBeenCalledWith(mockGroup, expect.objectContaining({
      name: "Fake", point_ids: [1, 23]
    }));
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it("removes a point from the current group if group editor is active", () => {
    mockPath = "/app/designer/groups/1";
    mockGroup.body.point_ids = [1, 2];
    const state = fakeState();
    const plant = fakePlant();
    plant.body.id = 2;
    state.resources = buildResourceIndex([plant]);
    const dispatch = jest.fn();
    const getState: GetState = jest.fn(() => state);
    clickMapPlant(plant.uuid, "bar")(dispatch, getState);
    expect(overwrite).toHaveBeenCalledWith(mockGroup, expect.objectContaining({
      name: "Fake", point_ids: [1]
    }));
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});
