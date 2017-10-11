const mockStorj: Dictionary<boolean> = {};

jest.mock("../../../session", () => {
  return {
    Session: {
      getBool: (k: string) => {
        mockStorj[k] = !!mockStorj[k];
        return mockStorj[k];
      }
    }
  };
});

import { Dictionary } from "farmbot";
import * as React from "react";
import { GardenPlant } from "../garden_plant";
import { shallow } from "enzyme";
import { GardenPlantProps } from "../interfaces";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { BooleanSetting } from "../../../session_keys";

describe("<GardenPlant/>", () => {
  function fakeProps(): GardenPlantProps {
    return {
      mapTransformProps: {
        quadrant: 2, gridSize: { x: 3000, y: 1500 }
      },
      plant: fakePlant(),
      selected: false,
      dragging: false,
      dispatch: jest.fn(),
      zoomLvl: 1.8,
      activeDragXY: { x: undefined, y: undefined, z: undefined },
      uuid: ""
    };
  }

  it("renders plant", () => {
    mockStorj[BooleanSetting.disableAnimations] = true;
    const wrapper = shallow(<GardenPlant {...fakeProps() } />);
    expect(wrapper.find("image").length).toEqual(1);
    expect(wrapper.find("image").props().opacity).toEqual(1);
    expect(wrapper.find("text").length).toEqual(0);
    expect(wrapper.find("rect").length).toBeLessThanOrEqual(1);
    expect(wrapper.find("use").length).toEqual(0);
    expect(wrapper.find(".soil-cloud").length).toEqual(0);
  });

  it("renders plant animations", () => {
    mockStorj[BooleanSetting.disableAnimations] = false;
    const wrapper = shallow(<GardenPlant {...fakeProps() } />);
    expect(wrapper.find(".soil-cloud").length).toEqual(1);
    expect(wrapper.find(".animate").length).toEqual(1);
  });
});
