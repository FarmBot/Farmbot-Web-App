import * as React from "react";
import { GardenPoint } from "../garden_point";
import { shallow } from "enzyme";
import { GardenPointProps } from "../interfaces";
import { fakePoint } from "../../../__test_support__/fake_state/resources";

describe("<GardenPoint/>", () => {
  function fakeProps(): GardenPointProps {
    return {
      mapTransformProps: {
        quadrant: 2, gridSize: { x: 3000, y: 1500 }
      },
      point: fakePoint()
    };
  }

  it("renders point", () => {
    const wrapper = shallow(<GardenPoint {...fakeProps() } />);
    expect(wrapper.find("#point-radius").props().r).toEqual(100);
    expect(wrapper.find("#point-center").props().r).toEqual(2);
  });

});
