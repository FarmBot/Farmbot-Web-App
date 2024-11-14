import React from "react";
import { mount } from "enzyme";
import { ThreeDGardenMapProps, ThreeDGardenMap } from "../three_d_garden_map";
import { fakeMapTransformProps } from "../../__test_support__/map_transform_props";
import { fakeBotSize } from "../../__test_support__/fake_bot_data";
import { fakeDesignerState } from "../../__test_support__/fake_designer_state";

describe("<ThreeDGardenMap />", () => {
  const fakeProps = (): ThreeDGardenMapProps => ({
    mapTransformProps: fakeMapTransformProps(),
    botSize: fakeBotSize(),
    gridOffset: { x: 10, y: 10 },
    get3DConfigValue: () => 1,
    sourceFbosConfig: () => ({ value: 0, consistent: true }),
    designer: fakeDesignerState(),
  });

  it("renders", () => {
    const wrapper = mount(<ThreeDGardenMap {...fakeProps()} />);
    expect(wrapper.html()).toContain("three-d-garden");
  });
});
