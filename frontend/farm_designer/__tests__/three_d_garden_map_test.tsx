import React from "react";
import { mount } from "enzyme";
import { ThreeDGardenMapProps, ThreeDGardenMap } from "../three_d_garden_map";

describe("<ThreeDGardenMap />", () => {
  const fakeProps = (): ThreeDGardenMapProps => ({
  });

  it("renders", () => {
    const wrapper = mount(<ThreeDGardenMap {...fakeProps()} />);
    expect(wrapper.html()).toContain("three-d-garden");
  });
});
