import * as React from "react";
import { MapBackground } from "../map_background";
import { shallow } from "enzyme";
import { MapBackgroundProps } from "../../interfaces";
import {
  fakeMapTransformProps
} from "../../../../__test_support__/map_transform_props";

describe("<MapBackground/>", () => {
  function fakeProps(): MapBackgroundProps {
    return {
      mapTransformProps: fakeMapTransformProps(),
      plantAreaOffset: { x: 100, y: 100 },
      templateView: false,
    };
  }

  it("renders map background", () => {
    const wrapper = shallow(<MapBackground {...fakeProps()} />);
    expect(wrapper.find("#bed-interior").props()).toEqual(
      expect.objectContaining({ width: 3180, height: 1680 }));
    expect(wrapper.find("#bed-border").props()).toEqual(
      expect.objectContaining({ width: 3200, height: 1700 }));
  });

  it("renders map background: X&Y swapped", () => {
    const p = fakeProps();
    p.mapTransformProps.xySwap = true;
    const wrapper = shallow(<MapBackground {...p} />);
    expect(wrapper.find("#bed-interior").props()).toEqual(
      expect.objectContaining({ width: 1680, height: 3180 }));
    expect(wrapper.find("#bed-border").props()).toEqual(
      expect.objectContaining({ width: 1700, height: 3200 }));
  });
});
