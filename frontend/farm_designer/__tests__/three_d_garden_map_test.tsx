import React from "react";
import { mount } from "enzyme";
import { ThreeDGardenMapProps, ThreeDGardenMap } from "../three_d_garden_map";
import { fakeMapTransformProps } from "../../__test_support__/map_transform_props";
import { fakeBotSize } from "../../__test_support__/fake_bot_data";

describe("<ThreeDGardenMap />", () => {
  const fakeProps = (): ThreeDGardenMapProps => ({
    mapTransformProps: fakeMapTransformProps(),
    botSize: fakeBotSize(),
    gridOffset: { x: 10, y: 10 },
  });

  it("renders", () => {
    const wrapper = mount(<ThreeDGardenMap {...fakeProps()} />);
    expect(wrapper.html()).toContain("three-d-garden");
  });
});
