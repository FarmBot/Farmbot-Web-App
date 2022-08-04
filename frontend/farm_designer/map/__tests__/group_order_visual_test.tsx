import React from "react";
import {
  GroupOrder, GroupOrderProps,
} from "../../map/group_order_visual";
import {
  fakeMapTransformProps,
} from "../../../__test_support__/map_transform_props";
import {
  fakePlant, fakePoint, fakePointGroup,
} from "../../../__test_support__/fake_state/resources";
import { svgMount } from "../../../__test_support__/svg_mount";
import { ExtendedPointGroupSortType } from "../../../point_groups/paths";
import { shallow } from "enzyme";
import { times } from "lodash";

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
      tryGroupSortType: undefined,
    };
  };

  it("renders group order", () => {
    const wrapper = svgMount(<GroupOrder {...fakeProps()} />);
    expect(wrapper.find("line").length).toEqual(3);
  });

  it("updates", () => {
    const p = fakeProps();
    const wrapper = shallow<GroupOrder>(<GroupOrder {...p} />);
    expect(wrapper.instance().shouldComponentUpdate(p)).toBeTruthy();
    p.groupPoints = times(51, fakePoint);
    wrapper.setProps(p);
    expect(wrapper.instance().shouldComponentUpdate(p)).toBeFalsy();
  });

  it.each<[ExtendedPointGroupSortType]>([
    ["nn"],
    ["xy_alternating"],
    ["yx_alternating"],
  ])("renders group order: %s", (sortType) => {
    const p = fakeProps();
    p.zoomLvl = 1.5;
    p.tryGroupSortType = sortType;
    const wrapper = svgMount(<GroupOrder {...p} />);
    expect(wrapper.find("line").length).toEqual(3);
  });
});
