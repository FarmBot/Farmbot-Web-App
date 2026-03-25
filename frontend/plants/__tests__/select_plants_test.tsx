/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  RawSelectPlants as SelectPlants, SelectPlantsProps, mapStateToProps,
  getFilteredPoints, GetFilteredPointsProps, validPointTypes, SelectModeLink,
  pointGroupSubset,
  uncategorizedGroupSubset,
  SelectModeLinkProps,
} from "../select_plants";
import {
  fakePlant, fakePoint, fakeWeed, fakeToolSlot, fakeTool,
  fakePlantTemplate,
  fakeWebAppConfig,
  fakePointGroup,
} from "../../__test_support__/fake_state/resources";
import { Actions, Content } from "../../constants";
import * as crud from "../../api/crud";
import * as pointGroupActions from "../../point_groups/actions";
import { fakeState } from "../../__test_support__/fake_state";
import { error } from "../../toast/toast";
import { mockDispatch } from "../../__test_support__/fake_dispatch";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { POINTER_TYPES } from "../../point_groups/criteria/interfaces";
import { fakeToolTransformProps } from "../../__test_support__/fake_tool_info";
import { SpecialStatus } from "farmbot";
import * as plantActions from "../../farm_designer/map/layers/plants/plant_actions";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { Path } from "../../internal_urls";
import * as mapActions from "../../farm_designer/map/actions";
import * as ui from "../../ui";
import { FBSelectProps } from "../../ui/new_fb_select";
import { DropDownItem } from "../../ui/fb_select";

let fbSelectSpy: jest.SpyInstance;

beforeEach(() => {
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation(((props: FBSelectProps) => {
      const value = props.selectedItem ? String(props.selectedItem.value) : "";
      return <select
        className={"mock-fb-select"}
        value={value}
        onChange={e => {
          const nextValue = e.currentTarget.value;
          const selected = nextValue === ""
            ? props.list.find((item: DropDownItem) => item.isNull)
            || props.list.find((item: DropDownItem) =>
              String(item.value) === "")
            : props.list.find((item: DropDownItem) =>
              String(item.value) === nextValue);
          selected && props.onChange(selected);
        }}>
        <option value={""} />
        {props.list.map((item: DropDownItem, index: number) =>
          <option key={`${item.value}-${index}`} value={String(item.value)}>
            {item.label}
          </option>)}
      </select>;
    }) as never);
});

afterEach(() => {
  fbSelectSpy.mockRestore();
});

describe("<SelectPlants />", () => {
  let createGroupSpy: jest.SpyInstance;
  let destroySpy: jest.SpyInstance;
  let savePointsSpy: jest.SpyInstance;
  let unselectPlantSpy: jest.SpyInstance;

  beforeEach(() => {
    createGroupSpy = jest.spyOn(pointGroupActions, "createGroup")
      .mockImplementation(jest.fn());
    destroySpy = jest.spyOn(crud, "destroy")
      .mockImplementation(() => Promise.resolve() as never);
    savePointsSpy = jest.spyOn(plantActions, "savePoints")
      .mockImplementation(jest.fn());
    unselectPlantSpy = jest.spyOn(mapActions, "unselectPlant")
      .mockImplementation(() => jest.fn());
  });

  afterEach(() => {
    createGroupSpy.mockRestore();
    destroySpy.mockRestore();
    savePointsSpy.mockRestore();
    unselectPlantSpy.mockRestore();
  });

  beforeEach(() => {
    location.pathname = Path.mock(Path.plants("select"));
  });

  function fakeProps(): SelectPlantsProps {
    const plant1 = fakePlant();
    plant1.uuid = "plant.1";
    plant1.body.name = "Strawberry";
    const plant2 = fakePlant();
    plant2.uuid = "plant.2";
    plant2.body.name = "Blueberry";
    return {
      selected: ["plant.1"],
      selectionPointType: undefined,
      getConfigValue: () => true,
      plants: [plant1, plant2],
      dispatch: jest.fn(x => x),
      gardenOpenId: undefined,
      allPoints: [],
      toolTransformProps: fakeToolTransformProps(),
      isActive: () => false,
      tools: [],
      groups: [],
      timeSettings: fakeTimeSettings(),
      bulkPlantSlug: undefined,
      noUTM: false,
      curves: [],
    };
  }

  it("displays selected plant", () => {
    render(<SelectPlants {...fakeProps()} />);
    expect(screen.getByText("Strawberry")).toBeInTheDocument();
  });

  it("displays selected point", () => {
    const p = fakeProps();
    const point = fakePoint();
    point.body.name = "fake point";
    p.allPoints = [point];
    p.selected = [point.uuid];
    p.selectionPointType = ["GenericPointer"];
    render(<SelectPlants {...p} />);
    expect(screen.getByText(point.body.name)).toBeInTheDocument();
  });

  it("displays selected weed", () => {
    const p = fakeProps();
    const weed = fakeWeed();
    weed.body.name = "fake weed";
    p.allPoints = [weed];
    p.selected = [weed.uuid];
    p.selectionPointType = ["Weed"];
    render(<SelectPlants {...p} />);
    expect(screen.getByText(weed.body.name)).toBeInTheDocument();
  });

  it("displays selected points and weeds", () => {
    const p = fakeProps();
    const point = fakePoint();
    point.body.name = "fake point";
    const weed = fakeWeed();
    weed.body.name = "fake weed";
    p.allPoints = [point, weed];
    p.selected = [point.uuid, weed.uuid];
    p.selectionPointType = ["GenericPointer", "Weed"];
    render(<SelectPlants {...p} />);
    expect(screen.getByText(point.body.name)).toBeInTheDocument();
    expect(screen.getByText(weed.body.name)).toBeInTheDocument();
  });

  it("displays selected slot", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.id = 1;
    tool.body.name = "fake tool slot";
    p.tools = [tool];
    const slot = fakeToolSlot();
    slot.body.tool_id = 1;
    p.allPoints = [slot];
    p.selected = [slot.uuid];
    p.selectionPointType = ["ToolSlot"];
    render(<SelectPlants {...p} />);
    expect(screen.getByText(tool.body.name)).toBeInTheDocument();
  });

  it("clears point selection type", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const { unmount } = render(<SelectPlants {...p} />);
    unmount();
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SELECTION_POINT_TYPE,
      payload: undefined,
    });
  });

  it("displays multiple selected plants", () => {
    const p = fakeProps();
    p.selected = ["plant.1", "plant.2"];
    render(<SelectPlants {...p} />);
    expect(screen.getByText("Strawberry")).toBeInTheDocument();
    expect(screen.getByText("Blueberry")).toBeInTheDocument();
    expect(screen.getByTitle("Delete")).toBeInTheDocument();
  });

  it("displays selected plant count", () => {
    const p = fakeProps();
    p.selected = ["plant.1", "plant.2"];
    render(<SelectPlants {...p} />);
    expect(screen.getByText("2 plants selected")).toBeInTheDocument();
  });

  it("displays selected plant count: none", () => {
    const p = fakeProps();
    p.selected = undefined;
    render(<SelectPlants {...p} />);
    expect(screen.getByText("0 plants selected")).toBeInTheDocument();
  });

  it("displays no selected plants: selection empty", () => {
    const p = fakeProps();
    p.selected = [];
    render(<SelectPlants {...p} />);
    expect(screen.queryByText("Strawberry Plant")).not.toBeInTheDocument();
  });

  it("displays no selected plants: selection invalid", () => {
    const p = fakeProps();
    p.selected = ["not a uuid"];
    render(<SelectPlants {...p} />);
    expect(screen.queryByText("Strawberry Plant")).not.toBeInTheDocument();
  });

  it("changes selection type", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const { container } = render(<SelectPlants {...p} />);
    fireEvent.change(container.querySelectorAll(".mock-fb-select")[0], {
      target: { value: "All" },
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SELECTION_POINT_TYPE,
      payload: ["Plant", "GenericPointer", "Weed", "ToolSlot"],
    });
  });

  it("changes selection type: Plant pointer_type", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const { container } = render(<SelectPlants {...p} />);
    fireEvent.change(container.querySelectorAll(".mock-fb-select")[0], {
      target: { value: "Plant" },
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SELECTION_POINT_TYPE,
      payload: ["Plant"],
    });
  });

  it("selects all", () => {
    const p = fakeProps();
    render(<SelectPlants {...p} />);
    fireEvent.click(screen.getByTitle("Select all"));
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: ["plant.1", "plant.2"],
      type: Actions.SELECT_POINT,
    });
  });

  it("selects none", () => {
    const p = fakeProps();
    render(<SelectPlants {...p} />);
    fireEvent.click(screen.getByTitle("Select none"));
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: undefined,
      type: Actions.SELECT_POINT,
    });
  });

  it("selects group items", () => {
    const p = fakeProps();
    p.selected = undefined;
    const group = fakePointGroup();
    group.body.id = 1;
    const plant = fakePlant();
    plant.body.id = 1;
    group.body.point_ids = [1];
    p.groups = [group];
    p.allPoints = [plant];
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const { container } = render(<SelectPlants {...p} />);
    const groupSelect =
      (container.querySelectorAll(".mock-fb-select")[1] as HTMLSelectElement);
    expect(groupSelect.value).toEqual("");
    fireEvent.change(groupSelect, { target: { value: "1" } });
    expect(groupSelect.value).toEqual("1");
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SELECTION_POINT_TYPE,
      payload: ["Plant"],
    });
    expect(p.dispatch).toHaveBeenLastCalledWith({
      type: Actions.SELECT_POINT,
      payload: [plant.uuid],
    });
  });

  it("selects selection type", () => {
    const p = fakeProps();
    const group0 = fakePointGroup();
    group0.body.id = 0;
    group0.body.member_count = undefined;
    const group1 = fakePointGroup();
    group1.body.id = 1;
    group1.body.member_count = 1;
    group1.body.criteria.string_eq = { pointer_type: ["Plant"] };
    p.groups = [group0, group1];
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const { container } = render(<SelectPlants {...p} />);
    fireEvent.change(container.querySelectorAll(".mock-fb-select")[1], {
      target: { value: "1" },
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SELECTION_POINT_TYPE,
      payload: ["Plant"],
    });
  });

  it("selects selection type without criteria", () => {
    const p = fakeProps();
    const group = fakePointGroup();
    group.body.id = 1;
    group.body.criteria.string_eq = {};
    const plant = fakePlant();
    plant.body.id = 1;
    const weed = fakeWeed();
    weed.body.id = 2;
    group.body.point_ids = [1, 2];
    p.groups = [group];
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const { container } = render(<SelectPlants {...p} />);
    fireEvent.change(container.querySelectorAll(".mock-fb-select")[1], {
      target: { value: "1" },
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SELECTION_POINT_TYPE,
      payload: POINTER_TYPES,
    });
  });

  it("confirms deletion of selected plants", () => {
    const p = fakeProps();
    p.selected = ["plant.1", "plant.2"];
    render(<SelectPlants {...p} />);
    window.confirm = jest.fn();
    fireEvent.click(screen.getByTitle("Delete"));
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete 2 plants?");
  });

  it("deletes selected plants", () => {
    const p = fakeProps();
    destroySpy.mockImplementation(() => Promise.resolve() as never);
    p.selected = ["plant.1", "plant.2"];
    render(<SelectPlants {...p} />);
    window.confirm = () => true;
    fireEvent.click(screen.getByTitle("Delete"));
    expect(crud.destroy).toHaveBeenCalledWith("plant.1", true);
    expect(crud.destroy).toHaveBeenCalledWith("plant.2", true);
  });

  it("does not delete if selection is empty", () => {
    const p = fakeProps();
    destroySpy.mockImplementation(() => Promise.resolve() as never);
    p.selected = undefined;
    render(<SelectPlants {...p} />);
    fireEvent.click(screen.getByTitle("Delete"));
    expect(crud.destroy).not.toHaveBeenCalled();
  });

  it("errors when deleting selected plants", async () => {
    const p = fakeProps();
    destroySpy.mockImplementation(() => Promise.reject() as never);
    p.selected = ["plant.1", "plant.2"];
    render(<SelectPlants {...p} />);
    window.confirm = () => true;
    fireEvent.click(screen.getByTitle("Delete"));
    await expect(crud.destroy).toHaveBeenCalledWith("plant.1", true);
    await expect(crud.destroy).toHaveBeenCalledWith("plant.2", true);
  });

  it("shows other buttons", () => {
    render(<SelectPlants {...fakeProps()} />);
    expect(screen.getByTitle("Create group")).toBeInTheDocument();
  });

  it("creates group", () => {
    render(<SelectPlants {...fakeProps()} />);
    fireEvent.click(screen.getByTitle("Create group"));
    expect(pointGroupActions.createGroup).toHaveBeenCalled();
  });

  it("doesn't create group", () => {
    const p = fakeProps();
    p.gardenOpenId = 1;
    render(<SelectPlants {...p} />);
    fireEvent.click(screen.getByTitle("Create group"));
    expect(pointGroupActions.createGroup).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(Content.ERROR_PLANT_TEMPLATE_GROUP);
  });

  it("saves points", () => {
    const p = fakeProps();
    const point0 = fakePoint();
    point0.specialStatus = SpecialStatus.DIRTY;
    const point1 = fakePoint();
    point1.specialStatus = SpecialStatus.DIRTY;
    p.selected = [point0.uuid, point1.uuid];
    p.allPoints = [point0, point1];
    render(<SelectPlants {...p} />);
    fireEvent.click(screen.getByTitle("Save"));
    expect(plantActions.savePoints).toHaveBeenCalledWith({
      dispatch: p.dispatch,
      points: p.allPoints,
    });
  });
});

describe("mapStateToProps", () => {
  it("selects correct props", () => {
    const state = fakeState();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    state.resources = buildResourceIndex([plant1, plant2]);
    const result = mapStateToProps(state);
    expect(result).toBeTruthy();
    expect(result.selected).toBeUndefined();
    expect(result.plants.length).toBe(2);
    expect(result.dispatch).toBe(state.dispatch);
  });

  it("returns quadrant", () => {
    const state = fakeState();
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.bot_origin_quadrant = 2;
    state.resources = buildResourceIndex([webAppConfig]);
    expect(mapStateToProps(state).toolTransformProps.quadrant).toEqual(2);
  });
});

describe("getFilteredPoints()", () => {
  const plant = fakePlant();
  const point = fakePoint();
  const weed = fakeWeed();
  const slot = fakeToolSlot();

  const fakeProps = (): GetFilteredPointsProps => ({
    selectionPointType: undefined,
    getConfigValue: () => true,
    plants: [plant],
    allPoints: [plant, point, weed, slot],
  });

  it("returns filtered points: all", () => {
    const p = fakeProps();
    p.selectionPointType = ["Plant", "GenericPointer", "Weed", "ToolSlot"];
    expect(getFilteredPoints(p)).toEqual([plant, point, weed, slot]);
  });

  it("returns filtered points: none", () => {
    const p = fakeProps();
    p.selectionPointType = ["Plant", "GenericPointer", "Weed", "ToolSlot"];
    p.getConfigValue = () => false;
    expect(getFilteredPoints(p)).toEqual([]);
  });

  it("returns filtered points: plants", () => {
    const p = fakeProps();
    const plantTemplate = fakePlantTemplate();
    p.plants = [plantTemplate];
    expect(getFilteredPoints(p)).toEqual([plantTemplate]);
  });

  it("returns filtered points: tool slots", () => {
    const p = fakeProps();
    p.selectionPointType = ["ToolSlot"];
    expect(getFilteredPoints(p)).toEqual([slot]);
  });
});

describe("validPointTypes()", () => {
  it("returns valid pointer types", () => {
    expect(validPointTypes(["Plant"])).toEqual(["Plant"]);
  });

  it("returns undefined", () => {
    expect(validPointTypes(["nope"])).toEqual(undefined);
  });
});

describe("pointGroupSubset()", () => {
  it("returns filtered groups", () => {
    const group0 = fakePointGroup();
    group0.body.criteria.string_eq = {};
    const group1 = fakePointGroup();
    group1.body.criteria.string_eq = { pointer_type: ["Plant"] };
    const group2 = fakePointGroup();
    group2.body.criteria.string_eq = { pointer_type: ["Weed"] };
    expect(pointGroupSubset([group0, group1, group2], "Plant")).toEqual([group1]);
  });
});

describe("uncategorizedGroupSubset()", () => {
  it("returns filtered groups", () => {
    const group0 = fakePointGroup();
    group0.body.criteria.string_eq = {};
    const group1 = fakePointGroup();
    group1.body.criteria.string_eq = { pointer_type: ["Plant"] };
    const group2 = fakePointGroup();
    group2.body.criteria.string_eq = { pointer_type: ["Weed"] };
    expect(uncategorizedGroupSubset([group0, group1, group2])).toEqual([group0]);
  });
});

describe("<SelectModeLink />", () => {
  const fakeProps = (): SelectModeLinkProps => ({
    dispatch: jest.fn(),
  });

  it("navigates to panel", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    render(<SelectModeLink {...p} />);
    fireEvent.click(screen.getByTitle("open point select panel"));
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants("select"));
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN,
      payload: true,
    });
  });
});
