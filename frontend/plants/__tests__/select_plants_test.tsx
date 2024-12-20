let mockDestroy = jest.fn(() => Promise.resolve());
jest.mock("../../api/crud", () => ({ destroy: mockDestroy }));

jest.mock("../../point_groups/actions", () => ({ createGroup: jest.fn() }));

jest.mock("../../farm_designer/map/layers/plants/plant_actions", () => ({
  savePoints: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
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
import { clickButton } from "../../__test_support__/helpers";
import { destroy } from "../../api/crud";
import { createGroup } from "../../point_groups/actions";
import { fakeState } from "../../__test_support__/fake_state";
import { error } from "../../toast/toast";
import { mockDispatch } from "../../__test_support__/fake_dispatch";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { POINTER_TYPES } from "../../point_groups/criteria/interfaces";
import { fakeToolTransformProps } from "../../__test_support__/fake_tool_info";
import { SpecialStatus } from "farmbot";
import { savePoints } from "../../farm_designer/map/layers/plants/plant_actions";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { Path } from "../../internal_urls";

describe("<SelectPlants />", () => {
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
    const wrapper = mount(<SelectPlants {...fakeProps()} />);
    expect(wrapper.text()).toContain("Strawberry");
  });

  it("displays selected point", () => {
    const p = fakeProps();
    const point = fakePoint();
    point.body.name = "fake point";
    p.allPoints = [point];
    p.selected = [point.uuid];
    p.selectionPointType = ["GenericPointer"];
    const wrapper = mount(<SelectPlants {...p} />);
    expect(wrapper.text()).toContain(point.body.name);
  });

  it("displays selected weed", () => {
    const p = fakeProps();
    const weed = fakeWeed();
    weed.body.name = "fake weed";
    p.allPoints = [weed];
    p.selected = [weed.uuid];
    p.selectionPointType = ["Weed"];
    const wrapper = mount(<SelectPlants {...p} />);
    expect(wrapper.text()).toContain(weed.body.name);
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
    const wrapper = mount(<SelectPlants {...p} />);
    expect(wrapper.text()).toContain(point.body.name);
    expect(wrapper.text()).toContain(weed.body.name);
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
    const wrapper = mount(<SelectPlants {...p} />);
    expect(wrapper.text()).toContain(tool.body.name);
  });

  it("clears point selection type", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const wrapper = mount(<SelectPlants {...p} />);
    wrapper.unmount();
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SELECTION_POINT_TYPE,
      payload: undefined,
    });
  });

  it("displays multiple selected plants", () => {
    const p = fakeProps();
    p.selected = ["plant.1", "plant.2"];
    const wrapper = mount(<SelectPlants {...p} />);
    ["Strawberry", "Blueberry", "Delete"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("displays selected plant count", () => {
    const p = fakeProps();
    p.selected = ["plant.1", "plant.2"];
    const wrapper = mount(<SelectPlants {...p} />);
    expect(wrapper.text()).toContain("2 plants selected");
  });

  it("displays selected plant count: none", () => {
    const p = fakeProps();
    p.selected = undefined;
    const wrapper = mount(<SelectPlants {...p} />);
    expect(wrapper.text()).toContain("0 plants selected");
  });

  it("displays no selected plants: selection empty", () => {
    const p = fakeProps();
    p.selected = [];
    const wrapper = mount(<SelectPlants {...p} />);
    expect(wrapper.text()).not.toContain("Strawberry Plant");
  });

  it("displays no selected plants: selection invalid", () => {
    const p = fakeProps();
    p.selected = ["not a uuid"];
    const wrapper = mount(<SelectPlants {...p} />);
    expect(wrapper.text()).not.toContain("Strawberry Plant");
  });

  it("changes selection type", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const wrapper = mount<SelectPlants>(<SelectPlants {...p} />);
    const actionsWrapper = shallow(wrapper.instance().ActionButtons());
    actionsWrapper.find("FBSelect").first().simulate("change",
      { label: "", value: "All" });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SELECTION_POINT_TYPE,
      payload: ["Plant", "GenericPointer", "Weed", "ToolSlot"],
    });
  });

  it("changes selection type: Plant pointer_type", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const wrapper = mount<SelectPlants>(<SelectPlants {...p} />);
    const actionsWrapper = shallow(wrapper.instance().ActionButtons());
    actionsWrapper.find("FBSelect").first().simulate("change",
      { label: "", value: "Plant" });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SELECTION_POINT_TYPE,
      payload: ["Plant"],
    });
  });

  it("selects all", () => {
    const p = fakeProps();
    const wrapper = mount(<SelectPlants {...p} />);
    const button = wrapper.find('[title="Select all"]');
    clickButton(button, 0, "select all");
    expect(p.dispatch).toHaveBeenCalledWith(
      { payload: ["plant.1", "plant.2"], type: Actions.SELECT_POINT });
  });

  it("selects none", () => {
    const p = fakeProps();
    const wrapper = mount(<SelectPlants {...p} />);
    const button = wrapper.find('[title="Select none"]');
    clickButton(button, 0, "select none");
    expect(p.dispatch).toHaveBeenCalledWith(
      { payload: undefined, type: Actions.SELECT_POINT });
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
    const wrapper = mount<SelectPlants>(<SelectPlants {...p} />);
    const actionsWrapper = shallow(wrapper.instance().ActionButtons());
    expect(wrapper.state().group_id).toEqual(undefined);
    actionsWrapper.find("FBSelect").at(1).simulate("change", {
      label: "", value: 1
    });
    expect(wrapper.state().group_id).toEqual(1);
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
    const wrapper = mount<SelectPlants>(<SelectPlants {...p} />);
    const actionsWrapper = shallow(wrapper.instance().ActionButtons());
    actionsWrapper.find("FBSelect").at(1).simulate("change", {
      label: "", value: 1
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
    const wrapper = mount<SelectPlants>(<SelectPlants {...p} />);
    const actionsWrapper = shallow(wrapper.instance().ActionButtons());
    actionsWrapper.find("FBSelect").at(1).simulate("change", {
      label: "", value: 1
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SELECTION_POINT_TYPE,
      payload: POINTER_TYPES,
    });
  });

  const DELETE_BTN_INDEX = 4;

  it("confirms deletion of selected plants", () => {
    const p = fakeProps();
    p.selected = ["plant.1", "plant.2"];
    const wrapper = mount(<SelectPlants {...p} />);
    window.confirm = jest.fn();
    clickButton(wrapper, DELETE_BTN_INDEX, "Delete");
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete 2 plants?");
  });

  it("deletes selected plants", () => {
    const p = fakeProps();
    mockDestroy = jest.fn(() => Promise.resolve());
    p.selected = ["plant.1", "plant.2"];
    const wrapper = mount(<SelectPlants {...p} />);
    window.confirm = () => true;
    clickButton(wrapper, DELETE_BTN_INDEX, "Delete");
    expect(destroy).toHaveBeenCalledWith("plant.1", true);
    expect(destroy).toHaveBeenCalledWith("plant.2", true);
  });

  it("does not delete if selection is empty", () => {
    const p = fakeProps();
    mockDestroy = jest.fn(() => Promise.resolve());
    p.selected = undefined;
    const wrapper = mount(<SelectPlants {...p} />);
    clickButton(wrapper, DELETE_BTN_INDEX, "Delete");
    expect(destroy).not.toHaveBeenCalled();
  });

  it("errors when deleting selected plants", async () => {
    const p = fakeProps();
    mockDestroy = jest.fn(() => Promise.reject());
    p.selected = ["plant.1", "plant.2"];
    const wrapper = mount(<SelectPlants {...p} />);
    window.confirm = () => true;
    await clickButton(wrapper, DELETE_BTN_INDEX, "Delete");
    await expect(destroy).toHaveBeenCalledWith("plant.1", true);
    await expect(destroy).toHaveBeenCalledWith("plant.2", true);
  });

  it("shows other buttons", () => {
    const wrapper = mount(<SelectPlants {...fakeProps()} />);
    expect(wrapper.text()).toContain("Create");
  });

  it("creates group", () => {
    const wrapper = mount(<SelectPlants {...fakeProps()} />);
    wrapper.find(".dark-blue").simulate("click");
    expect(createGroup).toHaveBeenCalled();
  });

  it("doesn't create group", () => {
    const p = fakeProps();
    p.gardenOpenId = 1;
    const wrapper = mount(<SelectPlants {...p} />);
    wrapper.find(".dark-blue").simulate("click");
    expect(createGroup).not.toHaveBeenCalled();
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
    const wrapper = mount(<SelectPlants {...p} />);
    const saveBtn = wrapper.find(".fb-button.green").first();
    saveBtn.simulate("click");
    expect(saveBtn.text().toLowerCase()).toEqual("save");
    expect(savePoints).toHaveBeenCalledWith({
      dispatch: p.dispatch,
      points: p.allPoints,
    });
  });
});

describe("mapStateToProps", () => {
  it("selects correct props", () => {
    const state = fakeState();
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
    const button = screen.getByTitle("open point select panel");
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants("select"));
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN,
      payload: true,
    });
  });
});
