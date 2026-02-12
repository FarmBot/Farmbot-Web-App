jest.mock("../../../ui", () => {
  const React = require("react");
  const actual = jest.requireActual("../../../ui");
  return {
    ...actual,
    FBSelect: (props: any) => {
      const value = props.selectedItem ? String(props.selectedItem.value) : "";
      return <select
        className={"mock-fb-select"}
        value={value}
        onChange={e => {
          const nextValue = e.currentTarget.value;
          const selected = nextValue === ""
            ? props.list.find((item: any) => item.isNull)
            || props.list.find((item: any) => String(item.value) === "")
            : props.list.find((item: any) =>
              String(item.value) === nextValue);
          props.onChange(selected || { label: "", value: nextValue });
        }}>
        <option value={""} />
        {props.list.map((item: any, index: number) =>
          <option key={`${item.value}-${index}`} value={String(item.value)}>
            {item.label}
          </option>)}
      </select>;
    },
  };
});

import React from "react";
import { render, fireEvent, act } from "@testing-library/react";
import {
  calcMaxCount,
  GroupCriteria, GroupPointCountBreakdown,
  MoreIndicatorIcon, MoreIndicatorIconProps,
  PointTypeSelection,
} from "..";
import {
  GroupCriteriaProps, GroupPointCountBreakdownProps, DEFAULT_CRITERIA,
  PointTypeSelectionProps,
} from "../interfaces";
import {
  fakePointGroup, fakePoint,
} from "../../../__test_support__/fake_state/resources";
import { cloneDeep, times } from "lodash";
import { Actions } from "../../../constants";
import * as groupActions from "../../actions";
import * as criteriaEdit from "../edit";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import {
  fakeToolTransformProps,
} from "../../../__test_support__/fake_tool_info";

let overwriteGroupSpy: jest.SpyInstance;
let togglePointTypeCriteriaSpy: jest.SpyInstance;

beforeEach(() => {
  overwriteGroupSpy = jest.spyOn(groupActions, "overwriteGroup")
    .mockImplementation(jest.fn());
  togglePointTypeCriteriaSpy = jest.spyOn(criteriaEdit, "togglePointTypeCriteria")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  jest.restoreAllMocks();
});

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
    const { container } = render(<GroupCriteria {...fakeProps()} />);
    ["filters", "age"].map(string =>
      expect(container.textContent?.toLowerCase()).toContain(string));
  });

  it("mounts", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    p.group.body.criteria.string_eq.pointer_type = ["Weed"];
    render(<GroupCriteria {...p} />);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SELECTION_POINT_TYPE,
      payload: ["Weed"],
    });
  });

  it("toggles advanced view", () => {
    const groupRef = React.createRef<GroupCriteria>();
    const view = render(<GroupCriteria ref={groupRef} {...fakeProps()} />);
    expect(view.container.textContent).not.toContain("numbers");
    const menu = render(groupRef.current?.AdvancedToggleMenu());
    fireEvent.click(menu.container.querySelector("button") as Element);
    expect(view.container.textContent).toContain("numbers");
  });

  it("shows day criteria in advanced view", () => {
    const groupRef = React.createRef<GroupCriteria>();
    const view = render(<GroupCriteria ref={groupRef} {...fakeProps()} />);
    act(() => {
      groupRef.current?.setState({ advanced: true });
    });
    expect(view.container.textContent).toContain("day");
  });

  it("changes day criteria", () => {
    const groupRef = React.createRef<GroupCriteria>();
    render(<GroupCriteria ref={groupRef} {...fakeProps()} />);
    expect(groupRef.current?.state.dayChanged).toBeFalsy();
    act(() => {
      groupRef.current?.changeDay(true);
    });
    expect(groupRef.current?.state.dayChanged).toBeTruthy();
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
    const { container } = render(<GroupPointCountBreakdown {...p} />);
    ["1 manually selected", "2 selected by filters"].map(string =>
      expect(container.textContent).toContain(string));
  });

  it("renders point counts: undefined ids", () => {
    const p = fakeProps();
    const point1 = fakePoint();
    point1.body.id = undefined;
    const point2 = fakePoint();
    point2.body.id = undefined;
    p.pointsSelectedByGroup = [point1, point2];
    p.group.body.point_ids = [];
    const { container } = render(<GroupPointCountBreakdown {...p} />);
    ["0 manually selected", "2 selected by filters"].map(string =>
      expect(container.textContent).toContain(string));
  });

  it("clears point ids", () => {
    const p = fakeProps();
    p.group.body.point_ids = [1, 2];
    const { container } = render(<GroupPointCountBreakdown {...p} />);
    window.confirm = () => true;
    fireEvent.click(container.querySelectorAll("button")[0] as Element);
    const expectedBody = cloneDeep(p.group.body);
    expectedBody.point_ids = [];
    expect(overwriteGroupSpy).toHaveBeenCalledWith(p.group, expectedBody);
  });

  it("doesn't clear point ids", () => {
    const p = fakeProps();
    p.group.body.point_ids = [1, 2];
    const { container } = render(<GroupPointCountBreakdown {...p} />);
    window.confirm = () => false;
    fireEvent.click(container.querySelectorAll("button")[0] as Element);
    expect(overwriteGroupSpy).not.toHaveBeenCalled();
  });

  it("clears criteria", () => {
    const p = fakeProps();
    const { container } = render(<GroupPointCountBreakdown {...p} />);
    window.confirm = () => true;
    fireEvent.click(container.querySelectorAll("button")[1] as Element);
    const expectedBody = cloneDeep(p.group.body);
    expectedBody.criteria = DEFAULT_CRITERIA;
    expect(overwriteGroupSpy).toHaveBeenCalledWith(p.group, expectedBody);
  });

  it("doesn't clear criteria", () => {
    const p = fakeProps();
    const { container } = render(<GroupPointCountBreakdown {...p} />);
    window.confirm = () => false;
    fireEvent.click(container.querySelectorAll("button")[1] as Element);
    expect(overwriteGroupSpy).not.toHaveBeenCalled();
  });

  it("updates", () => {
    const p = fakeProps();
    const breakdownRef = React.createRef<GroupPointCountBreakdown>();
    const { rerender } = render(
      <GroupPointCountBreakdown ref={breakdownRef} {...p} />);
    expect(breakdownRef.current?.shouldComponentUpdate(p, { maxCount: 0 }))
      .toBeTruthy();
    p.pointsSelectedByGroup = times(51, fakePoint);
    rerender(<GroupPointCountBreakdown ref={breakdownRef} {...p} />);
    expect(breakdownRef.current?.shouldComponentUpdate(p, { maxCount: 41 }))
      .toBeFalsy();
  });

  it("expands", () => {
    const breakdownRef = React.createRef<GroupPointCountBreakdown>();
    render(<GroupPointCountBreakdown ref={breakdownRef} {...fakeProps()} />);
    expect(breakdownRef.current?.state.maxCount).not.toEqual(1000);
    act(() => {
      breakdownRef.current?.toggleExpand();
    });
    expect(breakdownRef.current?.state.maxCount).toEqual(1000);
  });

  it("collapses", () => {
    const breakdownRef = React.createRef<GroupPointCountBreakdown>();
    render(<GroupPointCountBreakdown ref={breakdownRef} {...fakeProps()} />);
    act(() => {
      breakdownRef.current?.setState({ maxCount: 1000 });
    });
    act(() => {
      breakdownRef.current?.toggleExpand();
    });
    expect(breakdownRef.current?.state.maxCount).not.toEqual(1000);
  });
});

describe("calcMaxCount()", () => {
  it("calculates max count", () => {
    const querySelectorSpy = jest.spyOn(document, "querySelector")
      .mockImplementation(() => ({ clientWidth: 400 } as unknown as Element));
    expect(calcMaxCount()).toEqual(39);
    querySelectorSpy.mockRestore();
  });

  it("handles null", () => {
    const querySelectorSpy = jest.spyOn(document, "querySelector")
      .mockImplementation(() => undefined);
    expect(calcMaxCount()).toEqual(41);
    querySelectorSpy.mockRestore();
  });
});

describe("<MoreIndicatorIcon />", () => {
  const fakeProps = (): MoreIndicatorIconProps => ({
    count: 100,
    maxCount: 50,
    onClick: jest.fn(),
  });

  it("returns indicator", () => {
    const { container } = render(<MoreIndicatorIcon {...fakeProps()} />);
    expect(container.textContent).toEqual("+50");
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
    const { container } = render(<PointTypeSelection {...p} />);
    fireEvent.change(container.querySelector(".mock-fb-select") as Element, {
      target: { value: "Plant" }
    });
    expect(togglePointTypeCriteriaSpy).toHaveBeenCalledWith(
      p.group, "Plant", true);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SELECTION_POINT_TYPE,
      payload: ["Plant"],
    });
  });

  it("doesn't select pointer_type", () => {
    const p = fakeProps();
    const { container } = render(<PointTypeSelection {...p} />);
    fireEvent.change(container.querySelector(".mock-fb-select") as Element, {
      target: { value: "nope" }
    });
    expect(togglePointTypeCriteriaSpy).not.toHaveBeenCalled();
  });

  it("changes pointer_type", () => {
    const p = fakeProps();
    p.pointTypes = ["Plant", "Weed"];
    const { container } = render(<PointTypeSelection {...p} />);
    fireEvent.click(container.querySelectorAll("input")[0] as Element);
    expect(togglePointTypeCriteriaSpy).toHaveBeenCalledWith(p.group, "Plant");
  });
});
