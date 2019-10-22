import { fakePointGroup } from "../../../__test_support__/fake_state/resources";
const mockGroup = fakePointGroup();
mockGroup.body.point_ids = [1, 2, 3];
jest.mock("../group_detail", () => ({ fetchGroupFromUrl: () => mockGroup }));

import * as React from "react";
import { GroupOrder, GroupOrderProps } from "../group_order_visual";
import {
  fakeMapTransformProps
} from "../../../__test_support__/map_transform_props";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { svgMount } from "../../../__test_support__/svg_mount";

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
    return {
      mapTransformProps: fakeMapTransformProps(),
      plants: [plant1, plant2, plant3],
    };
  };

  it("renders group order", () => {
    const wrapper = svgMount(<GroupOrder {...fakeProps()} />);
    expect(wrapper.find("line").length).toEqual(3);
  });
});
