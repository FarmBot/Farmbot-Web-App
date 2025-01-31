jest.mock("../../../api/crud", () => ({ edit: jest.fn() }));

jest.mock("../../../point_groups/actions", () => ({
  overwriteGroup: jest.fn(),
}));

import {
  fakePointGroup, fakePlant,
} from "../../../__test_support__/fake_state/resources";
const mockGroup = fakePointGroup();
jest.mock("../../../point_groups/group_detail", () => ({
  findGroupFromUrl: jest.fn(() => mockGroup)
}));

import {
  movePoints, closePlantInfo, setDragIcon, clickMapPlant, selectPoint,
  setHoveredPlant,
  mapPointClickAction,
  movePointTo,
} from "../actions";
import { MovePointToProps, MovePointsProps } from "../../interfaces";
import { edit } from "../../../api/crud";
import { Actions } from "../../../constants";
import { fakeState } from "../../../__test_support__/fake_state";
import { GetState } from "../../../redux/interfaces";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { overwriteGroup } from "../../../point_groups/actions";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import { Path } from "../../../internal_urls";

describe("movePoints", () => {
  it.each<[string, Record<"x" | "y", number>, Record<"x" | "y", number>]>([
    ["within bounds", { x: 1, y: 2 }, { x: 101, y: 202 }],
    ["too high", { x: 10000, y: 10000 }, { x: 3000, y: 1500 }],
    ["too low", { x: -10000, y: -10000 }, { x: 0, y: 0 }],
  ])("restricts plant to grid area: %s",
    (_test_description, attempted, expected) => {
      const payload: MovePointsProps = {
        deltaX: attempted.x,
        deltaY: attempted.y,
        points: [fakePlant()],
        gridSize: { x: 3000, y: 1500 }
      };
      movePoints(payload)(jest.fn());
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
        }));
    });
});

describe("movePointTo", () => {
  it("moves plant", () => {
    const payload: MovePointToProps = {
      x: 10000,
      y: 10000,
      point: fakePlant(),
      gridSize: { x: 3000, y: 1500 }
    };
    movePointTo(payload)(jest.fn());
    expect(edit).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ x: 100, y: 200 })
      }),
      expect.objectContaining({ x: 3000, y: 1500 }));
  });
});

describe("closePlantInfo()", () => {
  it("no plant info open", () => {
    location.pathname = Path.mock(Path.plants());
    const navigate = jest.fn();
    const dispatch = jest.fn();
    closePlantInfo(navigate, dispatch)();
    expect(navigate).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("plant edit open", () => {
    location.pathname = Path.mock(Path.plants(1));
    const navigate = jest.fn();
    const dispatch = jest.fn();
    closePlantInfo(navigate, dispatch)();
    expect(navigate).toHaveBeenCalledWith(Path.plants());
    expect(dispatch).toHaveBeenCalledWith({
      payload: undefined, type: Actions.SELECT_POINT
    });
  });

  it("plant info open", () => {
    location.pathname = Path.mock(Path.plants(1));
    const navigate = jest.fn();
    const dispatch = jest.fn();
    closePlantInfo(navigate, dispatch)();
    expect(navigate).toHaveBeenCalledWith(Path.plants());
    expect(dispatch).toHaveBeenCalledWith({
      payload: undefined, type: Actions.SELECT_POINT
    });
  });
});

describe("setDragIcon()", () => {
  it("sets the drag icon", () => {
    const setDragImage = jest.fn();
    const e = { currentTarget: new Image(), dataTransfer: { setDragImage } };
    setDragIcon("mint")(e);
    const img = new Image();
    img.src = "/crops/icons/mint.avif";
    expect(setDragImage).toHaveBeenCalledWith(img, 0, 0);
  });
});

describe("clickMapPlant", () => {
  it("selects plants and toggles hovered plant", () => {
    const state = fakeState();
    const dispatch = jest.fn();
    const getState: GetState = jest.fn(() => state);
    clickMapPlant("fakeUuid")(dispatch, getState);
    expect(dispatch).toHaveBeenCalledWith(selectPoint(["fakeUuid"]));
    expect(dispatch).toHaveBeenCalledWith(setHoveredPlant("fakeUuid"));
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it("adds a point to current group if group editor is active", () => {
    location.pathname = Path.mock(Path.groups(1));
    mockGroup.body.point_ids = [1];
    const state = fakeState();
    const plant = fakePlant();
    plant.body.id = 23;
    state.resources = buildResourceIndex([plant]);
    const dispatch = mockDispatch();
    const getState: GetState = jest.fn(() => state);
    clickMapPlant(plant.uuid)(dispatch, getState);
    expect(overwriteGroup).toHaveBeenCalledWith(mockGroup,
      expect.objectContaining({
        name: "Fake", point_ids: [1, 23]
      }));
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it("doesn't add a point to current group", () => {
    location.pathname = Path.mock(Path.groups(1));
    mockGroup.body.point_ids = [1];
    const state = fakeState();
    state.resources = buildResourceIndex([]);
    const dispatch = mockDispatch();
    const getState: GetState = jest.fn(() => state);
    clickMapPlant("missing plant uuid")(dispatch, getState);
    expect(overwriteGroup).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it("removes a point from the current group if group editor is active", () => {
    location.pathname = Path.mock(Path.groups(1));
    mockGroup.body.point_ids = [1, 2];
    const state = fakeState();
    const plant = fakePlant();
    plant.body.id = 2;
    state.resources = buildResourceIndex([plant]);
    const dispatch = mockDispatch();
    const getState: GetState = jest.fn(() => state);
    clickMapPlant(plant.uuid)(dispatch, getState);
    expect(overwriteGroup).toHaveBeenCalledWith(mockGroup,
      expect.objectContaining({
        name: "Fake", point_ids: [1]
      }));
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it("adds a plant to the current selection if plant select is active", () => {
    location.pathname = Path.mock(Path.plants("select"));
    const state = fakeState();
    const plant = fakePlant();
    plant.uuid = "Point.fakePlantUuid";
    state.resources = buildResourceIndex([plant]);
    const dispatch = jest.fn();
    const getState: GetState = jest.fn(() => state);
    clickMapPlant(plant.uuid)(dispatch, getState);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_POINT, payload: [plant.uuid]
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it("removes a plant to the current selection if plant select is active", () => {
    location.pathname = Path.mock(Path.plants("select"));
    const state = fakeState();
    const plant = fakePlant();
    plant.uuid = "Point.fakePlantUuid";
    state.resources = buildResourceIndex([plant]);
    state.resources.consumers.farm_designer.selectedPoints = [plant.uuid];
    const dispatch = jest.fn();
    const getState: GetState = jest.fn(() => state);
    clickMapPlant(plant.uuid)(dispatch, getState);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_POINT, payload: []
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});

describe("mapPointClickAction()", () => {
  it("navigates", () => {
    location.pathname = Path.mock(Path.plants());
    const navigate = jest.fn();
    const dispatch = jest.fn();
    const outerDispatch = mockDispatch(dispatch, fakeState);
    mapPointClickAction(navigate, outerDispatch, "uuid", "fake path")();
    expect(navigate).toHaveBeenCalledWith("fake path");
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN,
      payload: true,
    });
  });

  it("doesn't navigate: box select", () => {
    location.pathname = Path.mock(Path.plants("select"));
    const navigate = jest.fn();
    const dispatch = jest.fn();
    const outerDispatch = mockDispatch(dispatch, fakeState);
    mapPointClickAction(navigate, outerDispatch, "uuid", "fake path")();
    expect(navigate).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_POINT,
      payload: ["uuid"],
    });
  });

  it("doesn't navigate: group edit", () => {
    location.pathname = Path.mock(Path.groups(1));
    const navigate = jest.fn();
    const dispatch = jest.fn();
    const outerDispatch = mockDispatch(dispatch, fakeState);
    mapPointClickAction(navigate, outerDispatch, "uuid", "fake path")();
    expect(navigate).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({
      type: expect.any(String),
    }));
  });
});
