import * as React from "react";
import { MapBackground } from "../map_background";
import { shallow } from "enzyme";
import { MapBackgroundProps } from "../interfaces";

describe("<MapBackground/>", () => {
  function fakeProps(): MapBackgroundProps {
    return {
      mapTransformProps: {
        quadrant: 2, gridSize: { x: 3000, y: 1500 }
      },
      plantAreaOffset: { x: 100, y: 100 }
    };
  }

  it("renders map background", () => {
    const wrapper = shallow(<MapBackground {...fakeProps() } />);
    expect(wrapper.find("#bed-interior").props().width).toEqual(3180);
    expect(wrapper.find("#bed-border").props().width).toEqual(3200);
  });

});
