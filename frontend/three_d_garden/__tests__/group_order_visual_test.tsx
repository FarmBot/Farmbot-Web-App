import {
  fakePlant, fakePoint, fakePointGroup,
  fakeToolSlot,
  fakeWeed,
} from "../../__test_support__/fake_state/resources";
import * as groupDetail from "../../point_groups/group_detail";
import * as criteriaApply from "../../point_groups/criteria/apply";
import * as pointGroupSort from "../../point_groups/point_group_sort";

let mockGroup: TaggedPointGroup | undefined = fakePointGroup();
let mockGroupPoints = [fakePlant(), fakeToolSlot(), fakePoint(), fakeWeed()];

import React from "react";
import { render } from "@testing-library/react";
import {
  areGroupOrderPropsEqual,
  GroupOrderProps,
  GroupOrderVisual,
  GroupOrderVisualProps,
} from "../group_order_visual";
import { INITIAL } from "../config";
import { clone } from "lodash";
import { TaggedPointGroup } from "farmbot";
let sortGroupBySpy: jest.SpyInstance;
let pointsSelectedByGroupSpy: jest.SpyInstance;

beforeEach(() => {
  jest.spyOn(groupDetail, "findGroupFromUrl").mockImplementation(() => mockGroup);
  pointsSelectedByGroupSpy = jest.spyOn(criteriaApply, "pointsSelectedByGroup")
    .mockImplementation(() => mockGroupPoints);
  sortGroupBySpy = jest.spyOn(pointGroupSort, "sortGroupBy")
    .mockImplementation(((_method, pts) => pts));
});


describe("<GroupOrderVisual />", () => {
  const fakeProps = (): GroupOrderVisualProps => ({
    allPoints: [],
    groups: [],
    config: clone(INITIAL),
    getZ: () => 0,
    tryGroupSortType: undefined,
  });

  it("renders order visual: group sort setting", () => {
    const p = fakeProps();
    mockGroup = fakePointGroup();
    mockGroup.body.sort_type = "random";
    mockGroupPoints = [fakePlant(), fakeToolSlot(), fakePoint(), fakeWeed()];
    p.tryGroupSortType = undefined;
    const { container } = render(<GroupOrderVisual {...p} />);
    expect(container).toContainHTML("group-order");
    expect(sortGroupBySpy).toHaveBeenCalledWith("random", mockGroupPoints);
  });

  it("renders order visual: sort preview", () => {
    const p = fakeProps();
    mockGroup = fakePointGroup();
    mockGroup.body.sort_type = "random";
    mockGroupPoints = [fakePlant(), fakePlant()];
    p.tryGroupSortType = "nn";
    const { container } = render(<GroupOrderVisual {...p} />);
    expect(container).toContainHTML("group-order");
    expect(sortGroupBySpy).toHaveBeenCalledWith("nn", mockGroupPoints);
  });

  it("reuses selected group points across unchanged rerenders", () => {
    const p = fakeProps();
    mockGroup = fakePointGroup();
    mockGroup.body.sort_type = "random";
    mockGroupPoints = [fakePlant(), fakePlant()];
    const { rerender } = render(<GroupOrderVisual {...p} />);
    rerender(<GroupOrderVisual {...p} />);
    expect(pointsSelectedByGroupSpy).toHaveBeenCalledTimes(1);
  });

  it("reuses selected group points across unrelated array churn", () => {
    const p = fakeProps();
    const group = fakePointGroup();
    group.body.sort_type = "random";
    mockGroup = group;
    const point = fakePlant();
    mockGroupPoints = [point];
    p.allPoints = [point];
    p.groups = [group];
    const { rerender } = render(<GroupOrderVisual {...p} />);
    rerender(<GroupOrderVisual {...p}
      allPoints={[point]}
      groups={[fakePointGroup(), group]} />);
    expect(pointsSelectedByGroupSpy).toHaveBeenCalledTimes(1);
    expect(sortGroupBySpy).toHaveBeenCalledTimes(1);
  });

  it("reselects group points when criteria changes", () => {
    const p = fakeProps();
    const group1 = fakePointGroup();
    group1.body.id = 1;
    const group2 = clone(group1);
    group2.body = {
      ...group1.body,
      criteria: {
        ...group1.body.criteria,
        string_eq: { pointer_type: ["Plant"] },
      },
    };
    const point = fakePlant();
    mockGroup = group1;
    mockGroupPoints = [point];
    p.allPoints = [point];
    const { rerender } = render(<GroupOrderVisual {...p} />);
    mockGroup = group2;
    rerender(<GroupOrderVisual {...p} allPoints={[point]} />);
    expect(pointsSelectedByGroupSpy).toHaveBeenCalledTimes(2);
  });

  it("reselects group points when manual point count changes", () => {
    const p = fakeProps();
    const group1 = fakePointGroup();
    group1.body.point_ids = [1];
    const group2 = clone(group1);
    group2.body = { ...group1.body, point_ids: [1, 2] };
    const point = fakePlant();
    mockGroup = group1;
    mockGroupPoints = [point];
    p.allPoints = [point];
    const { rerender } = render(<GroupOrderVisual {...p} />);
    mockGroup = group2;
    rerender(<GroupOrderVisual {...p} allPoints={[point]} />);
    expect(pointsSelectedByGroupSpy).toHaveBeenCalledTimes(2);
  });

  it("reselects group points when manual point ids change", () => {
    const p = fakeProps();
    const group1 = fakePointGroup();
    group1.body.point_ids = [1, 2];
    const group2 = clone(group1);
    group2.body = { ...group1.body, point_ids: [2, 1] };
    const point = fakePlant();
    mockGroup = group1;
    mockGroupPoints = [point];
    p.allPoints = [point];
    const { rerender } = render(<GroupOrderVisual {...p} />);
    mockGroup = group2;
    rerender(<GroupOrderVisual {...p} allPoints={[point]} />);
    expect(pointsSelectedByGroupSpy).toHaveBeenCalledTimes(2);
  });

  it("resorts cached selected group points when sort type changes", () => {
    const p = fakeProps();
    const group1 = fakePointGroup();
    group1.body.sort_type = "xy_ascending";
    group1.body.point_ids = [1];
    const group2 = clone(group1);
    group2.body = {
      ...group1.body,
      point_ids: [...group1.body.point_ids],
      sort_type: "random",
    };
    const point = fakePlant();
    mockGroup = group1;
    mockGroupPoints = [point];
    p.allPoints = [point];
    const { rerender } = render(<GroupOrderVisual {...p} />);
    mockGroup = group2;
    rerender(<GroupOrderVisual {...p} allPoints={[point]} />);
    expect(pointsSelectedByGroupSpy).toHaveBeenCalledTimes(1);
    expect(sortGroupBySpy).toHaveBeenCalledTimes(2);
    expect(sortGroupBySpy).toHaveBeenLastCalledWith("random", mockGroupPoints);
  });

  it("doesn't render order visual when no group is found", () => {
    const p = fakeProps();
    mockGroup = undefined;
    mockGroupPoints = [fakePlant(), fakePlant()];
    const { container } = render(<GroupOrderVisual {...p} />);
    expect(container).not.toContainHTML("group-order");
  });

  it("doesn't render order visual when groupPoints is empty", () => {
    const p = fakeProps();
    mockGroup = fakePointGroup();
    mockGroupPoints = [];
    const { container } = render(<GroupOrderVisual {...p} />);
    expect(container).not.toContainHTML("group-order");
  });
});

describe("areGroupOrderPropsEqual()", () => {
  const fakeProps = (): GroupOrderProps => ({
    config: clone(INITIAL),
    getZ: jest.fn(),
    tryGroupSortType: undefined,
    sortType: "nn",
    groupPoints: [],
  });

  it("returns equal", () => {
    const pp = fakeProps();
    const np = fakeProps();
    expect(areGroupOrderPropsEqual(pp, np)).toBeTruthy();
  });

  it("returns not equal: config", () => {
    const pp = fakeProps();
    const np = fakeProps();
    np.config.exaggeratedZ = true;
    expect(areGroupOrderPropsEqual(pp, np)).toBeFalsy();
  });

  it("returns not equal: sortType", () => {
    const pp = fakeProps();
    const np = fakeProps();
    np.sortType = "random";
    expect(areGroupOrderPropsEqual(pp, np)).toBeFalsy();
  });

  it("returns not equal: trySortType", () => {
    const pp = fakeProps();
    const np = fakeProps();
    np.tryGroupSortType = "nn";
    expect(areGroupOrderPropsEqual(pp, np)).toBeFalsy();
  });

  it("returns not equal: points", () => {
    const pp = fakeProps();
    const np = fakeProps();
    np.groupPoints = [fakePlant()];
    expect(areGroupOrderPropsEqual(pp, np)).toBeFalsy();
  });

  it("returns not equal: point uuid", () => {
    const pp = fakeProps();
    const np = fakeProps();
    pp.groupPoints = [fakePlant()];
    np.groupPoints = [fakePlant()];
    expect(areGroupOrderPropsEqual(pp, np)).toBeFalsy();
  });
});
