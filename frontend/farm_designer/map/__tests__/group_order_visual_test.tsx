import { fakeState } from "../../../__test_support__/fake_state";
const mockState = fakeState();
jest.mock("../../../redux/store", () => ({
  store: { getState: () => mockState },
}));

import * as React from "react";
import {
  GroupOrder, GroupOrderProps, NNPath,
} from "../../map/group_order_visual";
import {
  fakeMapTransformProps,
} from "../../../__test_support__/map_transform_props";
import {
  fakePlant, fakePointGroup,
} from "../../../__test_support__/fake_state/resources";
import { svgMount } from "../../../__test_support__/svg_mount";
import { ExtendedPointGroupSortType } from "../../../point_groups/paths";

describe("<GroupOrder />", () => {
  const fakeProps = (): GroupOrderProps => {
    const plant1 = fakePlant();
    plant1.body.id = 1;
    const plant2 = fakePlant();
    plant2.body.id = 2;
    const plant3 = fakePlant();
    plant3.body.id = 3;
    const plant4 = fakePlant();
    plant4.body.id = undefined;
    const plant5 = fakePlant();
    plant5.body.id = 5;
    const group = fakePointGroup();
    group.body.point_ids = [1, 2, 3];
    return {
      mapTransformProps: fakeMapTransformProps(),
      zoomLvl: 1,
      groupPoints: [plant1, plant2, plant3],
      group,
    };
  };

  it("renders group order", () => {
    const wrapper = svgMount(<GroupOrder {...fakeProps()} />);
    expect(wrapper.find("line").length).toEqual(3);
  });

  it.each<[ExtendedPointGroupSortType]>([
    ["nn"],
    ["xy_alternating"],
    ["yx_alternating"],
  ])("renders group order: %s", (sortType) => {
    const p = fakeProps();
    p.zoomLvl = 1.5;
    mockState.resources.consumers.farm_designer.tryGroupSortType = sortType;
    const wrapper = svgMount(<GroupOrder {...p} />);
    expect(wrapper.find("line").length).toEqual(3);
  });
});

describe("<NNPath />", () => {
  const fakeProps = () => ({
    pathPoints: [],
    mapTransformProps: fakeMapTransformProps(),
  });

  it("doesn't render optimized path", () => {
    const wrapper = svgMount(<NNPath {...fakeProps()} />);
    expect(wrapper.html()).toEqual("<svg><g></g></svg>");
  });

  it("renders optimized path", () => {
    localStorage.setItem("try_it", "ok");
    const wrapper = svgMount(<NNPath {...fakeProps()} />);
    expect(wrapper.html()).not.toEqual("<svg><g></g></svg>");
  });
});
