import * as React from "react";
import { shallow } from "enzyme";
import {
  NegativePositionLabel, NegativePositionLabelProps
} from "../negative_position_labels";
import {
  fakeMapTransformProps
} from "../../../../../__test_support__/map_transform_props";

describe("<NegativePositionLabel />", () => {
  const fakeProps = (): NegativePositionLabelProps => {
    return {
      position: { x: 1234, y: undefined, z: undefined },
      mapTransformProps: fakeMapTransformProps(),
      plantAreaOffset: { x: 100, y: 100 }
    };
  };

  it("shows", () => {
    const p = fakeProps();
    p.position.y = -100;
    const wrapper = shallow(<NegativePositionLabel {...p} />);
    expect(wrapper.text()).toContain("(1234, -100, ---)");
    expect(wrapper.find("text").props().visibility).toEqual("visible");
  });

  it("doesn't show", () => {
    const p = fakeProps();
    p.position.y = 0;
    const wrapper = shallow(<NegativePositionLabel {...p} />);
    expect(wrapper.text()).toContain("(1234, 0, ---)");
    expect(wrapper.find("text").props().visibility).toEqual("hidden");
  });
});
