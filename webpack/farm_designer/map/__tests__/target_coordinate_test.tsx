import * as React from "react";
import { TargetCoordinate, TargetCoordinateProps } from "../target_coordinate";
import { shallow } from "enzyme";

describe("<TargetCoordinate/>", () => {
  function fakeProps(): TargetCoordinateProps {
    return {
      chosenLocation: {
        x: 100,
        y: 200,
        z: 0
      },
      mapTransformProps: {
        quadrant: 2, gridSize: { x: 3000, y: 1500 }
      }
    };
  }

  it("renders target", () => {
    const wrapper = shallow(<TargetCoordinate {...fakeProps() } />);
    const boxProps = wrapper.find("rect").props();
    expect(boxProps.x).toEqual(90);
    expect(boxProps.y).toEqual(198);
    expect(boxProps.width).toEqual(10);
    expect(boxProps.height).toEqual(4);
    expect(wrapper.find("use").length).toEqual(4);
  });
});
