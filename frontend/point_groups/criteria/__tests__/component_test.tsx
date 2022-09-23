jest.mock("../../actions", () => ({ overwriteGroup: jest.fn() }));

jest.mock("../edit", () => ({ togglePointTypeCriteria: jest.fn() }));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  calcMaxCount,
  GroupCriteria, GroupPointCountBreakdown,
  MoreIndicatorIcon, MoreIndicatorIconProps,
  PointTypeSelection,
  togglePointTypeCriteria,
} from "..";
import {
  GroupCriteriaProps, GroupPointCountBreakdownProps, DEFAULT_CRITERIA,
  PointTypeSelectionProps,
} from "../interfaces";
import {
  fakePointGroup, fakePoint,
} from "../../../__test_support__/fake_state/resources";
import { cloneDeep, times } from "lodash";
import { Checkbox } from "../../../ui";
import { Actions } from "../../../constants";
import { overwriteGroup } from "../../actions";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import {
  fakeToolTransformProps,
} from "../../../__test_support__/fake_tool_info";

describe("<GroupCriteria />", () => {
  const fakeProps = (): GroupCriteriaProps => ({
    dispatch: jest.fn(),
    group: fakePointGroup(),
    slugs: [],
    editGroupAreaInMap: false,
    botSize: {
      x: { value: 3000, isDefault: true },
      y: { value: 1500, isDefault: true },
      z: { value: 400, isDefault: true },
    },
    selectionPointType: undefined,
  });

  it("renders", () => {
    const wrapper = mount(<GroupCriteria {...fakeProps()} />);
    ["filters", "age"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("mounts", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    p.group.body.criteria.string_eq.pointer_type = ["Weed"];
    mount(<GroupCriteria {...p} />);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SELECTION_POINT_TYPE,
      payload: ["Weed"],
    });
  });

  it("toggles advanced view", () => {
    const wrapper = mount<GroupCriteria>(<GroupCriteria {...fakeProps()} />);
    expect(wrapper.text()).not.toContain("numbers");
    const menu = mount(wrapper.instance().AdvancedToggleMenu());
    menu.find("ToggleButton").first().simulate("click");
    expect(wrapper.text()).toContain("numbers");
  });

  it("shows day criteria in advanced view", () => {
    const wrapper = mount<GroupCriteria>(<GroupCriteria {...fakeProps()} />);
    wrapper.setState({ advanced: true });
    expect(wrapper.text()).toContain("day");
  });

  it("changes day criteria", () => {
    const wrapper = mount<GroupCriteria>(<GroupCriteria {...fakeProps()} />);
    expect(wrapper.state().dayChanged).toBeFalsy();
    wrapper.instance().changeDay(true);
    expect(wrapper.state().dayChanged).toBeTruthy();
  });
});

describe("<GroupPointCountBreakdown />", () => {
  const fakeProps = (): GroupPointCountBreakdownProps => ({
    group: fakePointGroup(),
    dispatch: jest.fn(),
    pointsSelectedByGroup: [],
    iconDisplay: true,
    hovered: undefined,
    tools: [],
    toolTransformProps: fakeToolTransformProps(),
    tryGroupSortType: undefined,
  });

  it("renders point counts", () => {
    const p = fakeProps();
    const point1 = fakePoint();
    point1.body.id = 1;
    const point2 = fakePoint();
    point2.body.id = 2;
    const point3 = fakePoint();
    point3.body.id = 3;
    p.pointsSelectedByGroup = [point1, point2, point3];
    p.group.body.point_ids = [1];
    const wrapper = mount(<GroupPointCountBreakdown {...p} />);
    ["1 manually selected", "2 selected by filters"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("renders point counts: undefined ids", () => {
    const p = fakeProps();
    const point1 = fakePoint();
    point1.body.id = undefined;
    const point2 = fakePoint();
    point2.body.id = undefined;
    p.pointsSelectedByGroup = [point1, point2];
    p.group.body.point_ids = [];
    const wrapper = mount(<GroupPointCountBreakdown {...p} />);
    ["0 manually selected", "2 selected by filters"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("clears point ids", () => {
    const p = fakeProps();
    p.group.body.point_ids = [1, 2];
    const wrapper = mount(<GroupPointCountBreakdown {...p} />);
    window.confirm = () => true;
    wrapper.find("button").first().simulate("click");
    const expectedBody = cloneDeep(p.group.body);
    expectedBody.point_ids = [];
    expect(overwriteGroup).toHaveBeenCalledWith(p.group, expectedBody);
  });

  it("doesn't clear point ids", () => {
    const p = fakeProps();
    p.group.body.point_ids = [1, 2];
    const wrapper = mount(<GroupPointCountBreakdown {...p} />);
    window.confirm = () => false;
    wrapper.find("button").first().simulate("click");
    expect(overwriteGroup).not.toHaveBeenCalled();
  });

  it("clears criteria", () => {
    const p = fakeProps();
    const wrapper = mount(<GroupPointCountBreakdown {...p} />);
    window.confirm = () => true;
    wrapper.find("button").last().simulate("click");
    const expectedBody = cloneDeep(p.group.body);
    expectedBody.criteria = DEFAULT_CRITERIA;
    expect(overwriteGroup).toHaveBeenCalledWith(p.group, expectedBody);
  });

  it("doesn't clear criteria", () => {
    const p = fakeProps();
    const wrapper = mount(<GroupPointCountBreakdown {...p} />);
    window.confirm = () => false;
    wrapper.find("button").last().simulate("click");
    expect(overwriteGroup).not.toHaveBeenCalled();
  });

  it("updates", () => {
    const p = fakeProps();
    const wrapper = mount<GroupPointCountBreakdown>(
      <GroupPointCountBreakdown {...p} />);
    expect(wrapper.instance().shouldComponentUpdate(p, { maxCount: 0 }))
      .toBeTruthy();
    p.pointsSelectedByGroup = times(51, fakePoint);
    wrapper.setProps(p);
    expect(wrapper.instance().shouldComponentUpdate(p, { maxCount: 41 }))
      .toBeFalsy();
  });

  it("expands", () => {
    const wrapper = mount<GroupPointCountBreakdown>(
      <GroupPointCountBreakdown {...fakeProps()} />);
    expect(wrapper.state().maxCount).not.toEqual(1000);
    wrapper.instance().toggleExpand();
    expect(wrapper.state().maxCount).toEqual(1000);
  });

  it("collapses", () => {
    const wrapper = mount<GroupPointCountBreakdown>(
      <GroupPointCountBreakdown {...fakeProps()} />);
    wrapper.setState({ maxCount: 1000 });
    wrapper.instance().toggleExpand();
    expect(wrapper.state().maxCount).not.toEqual(1000);
  });
});

describe("calcMaxCount()", () => {
  it("calculates max count", () => {
    Object.defineProperty(document, "querySelector", {
      value: () => ({ clientWidth: 400 }), configurable: true
    });
    expect(calcMaxCount()).toEqual(39);
  });

  it("handles null", () => {
    Object.defineProperty(document, "querySelector", {
      value: () => undefined, configurable: true
    });
    expect(calcMaxCount()).toEqual(41);
  });
});

describe("<MoreIndicatorIcon />", () => {
  const fakeProps = (): MoreIndicatorIconProps => ({
    count: 100,
    maxCount: 50,
    onClick: jest.fn(),
  });

  it("returns indicator", () => {
    const wrapper = mount(<MoreIndicatorIcon {...fakeProps()} />);
    expect(wrapper.text()).toEqual("+50");
  });
});

describe("<PointTypeSelection />", () => {
  const fakeProps = (): PointTypeSelectionProps => ({
    dispatch: jest.fn(),
    group: fakePointGroup(),
    pointTypes: [],
  });

  it("selects pointer_type", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const wrapper = shallow(<PointTypeSelection {...p} />);
    wrapper.find("FBSelect").simulate("change", { label: "", value: "Plant" });
    expect(togglePointTypeCriteria).toHaveBeenCalledWith(p.group, "Plant", true);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SELECTION_POINT_TYPE,
      payload: ["Plant"],
    });
  });

  it("doesn't select pointer_type", () => {
    const p = fakeProps();
    const wrapper = shallow(<PointTypeSelection {...p} />);
    wrapper.find("FBSelect").simulate("change", { label: "", value: "nope" });
    expect(togglePointTypeCriteria).not.toHaveBeenCalled();
  });

  it("changes pointer_type", () => {
    const p = fakeProps();
    p.pointTypes = ["Plant", "Weed"];
    const wrapper = shallow(<PointTypeSelection {...p} />);
    wrapper.find(Checkbox).first().simulate("change");
    expect(togglePointTypeCriteria).toHaveBeenCalledWith(p.group, "Plant");
  });
});
