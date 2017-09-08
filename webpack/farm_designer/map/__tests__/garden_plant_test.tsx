import * as React from "react";
import { GardenPlant } from "../garden_plant";
import { shallow } from "enzyme";
import { GardenPlantProps } from "../interfaces";
import { fakePlant } from "../../../__test_support__/fake_state/resources";

describe("<GardenPlant/>", () => {
  function fakeProps(): GardenPlantProps {
    return {
      mapTransformProps: {
        quadrant: 2, gridSize: { x: 3000, y: 1500 }
      },
      plant: fakePlant(),
      selected: false,
      dragging: false,
      onClick: jest.fn(),
      dispatch: jest.fn(),
      zoomLvl: 1.8,
      activeDragXY: { x: undefined, y: undefined, z: undefined },
      plantAreaOffset: { x: 100, y: 100 }
    };
  }

  it("renders plant", () => {
    const wrapper = shallow(<GardenPlant {...fakeProps() } />);
    expect(wrapper.find("image").length).toEqual(1);
    expect(wrapper.find("image").props().opacity).toEqual(1);
    expect(wrapper.find("Circle").length).toEqual(1);
    expect(wrapper.find("Circle").props().selected).toBeFalsy();
    expect(wrapper.find("text").length).toEqual(0);
    expect(wrapper.find("rect").length).toBeLessThanOrEqual(1);
    expect(wrapper.find("use").length).toEqual(0);
  });

});
