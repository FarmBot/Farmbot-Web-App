import React from "react";
import { mount } from "enzyme";
import { DistanceIndicator, DistanceIndicatorProps } from "../distance_indicator";

describe("<DistanceIndicator />", () => {
  const fakeProps = (): DistanceIndicatorProps => ({
    start: { x: 0, y: 0, z: 0 },
    end: { x: 100, y: 0, z: 0 },
  });

  it("renders", () => {
    const wrapper = mount(<DistanceIndicator {...fakeProps()} />);
    expect(wrapper.html()).toContain("box");
    expect(wrapper.html()).toContain("text");
    expect(wrapper.html()).toContain("arrow");
    expect(wrapper.html()).toContain("100mm");
    expect(wrapper.html()).toContain("extrude");
  });
});
