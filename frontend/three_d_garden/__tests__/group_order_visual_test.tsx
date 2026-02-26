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

beforeEach(() => {
  jest.spyOn(groupDetail, "findGroupFromUrl").mockImplementation(() => mockGroup);
  jest.spyOn(criteriaApply, "pointsSelectedByGroup")
    .mockImplementation(() => mockGroupPoints);
  sortGroupBySpy = jest.spyOn(pointGroupSort, "sortGroupBy")
    .mockImplementation(((_method, pts) => pts) as typeof pointGroupSort.sortGroupBy);
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
});
