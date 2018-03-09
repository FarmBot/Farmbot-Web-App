const mockStorj: Dictionary<boolean> = {};

jest.mock("../../../session", () => {
  return {
    Session: {
      deprecatedGetBool: (k: string) => {
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
import { Actions } from "../../../constants";

describe("<GardenPlant/>", () => {
  function fakeProps(): GardenPlantProps {
    return {
      mapTransformProps: {
        quadrant: 2, gridSize: { x: 3000, y: 1500 }
      },
      plant: fakePlant(),
      selected: false,
      grayscale: false,
      dragging: false,
      dispatch: jest.fn(),
      zoomLvl: 1.8,
      activeDragXY: { x: undefined, y: undefined, z: undefined },
      uuid: "plantUuid"
    };
  }

  it("renders plant", () => {
    mockStorj[BooleanSetting.disable_animations] = true;
    const wrapper = shallow(<GardenPlant {...fakeProps() } />);
    expect(wrapper.find("image").length).toEqual(1);
    expect(wrapper.find("image").props().opacity).toEqual(1);
    expect(wrapper.find("text").length).toEqual(0);
    expect(wrapper.find("rect").length).toBeLessThanOrEqual(1);
    expect(wrapper.find("use").length).toEqual(0);
    expect(wrapper.find(".soil-cloud").length).toEqual(0);
  });

  it("renders plant animations", () => {
    mockStorj[BooleanSetting.disable_animations] = false;
    const wrapper = shallow(<GardenPlant {...fakeProps() } />);
    expect(wrapper.find(".soil-cloud").length).toEqual(1);
    expect(wrapper.find(".animate").length).toEqual(1);
  });

  it("Calls the onClick callback", () => {
    const p = fakeProps();
    const wrapper = shallow(<GardenPlant {...p } />);
    wrapper.find("image").at(0).simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_PLANT,
      payload: [p.uuid]
    });
  });

  it("begins hover", () => {
    const p = fakeProps();
    const wrapper = shallow(<GardenPlant {...p } />);
    wrapper.find("image").at(0).simulate("mouseEnter");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_PLANT_LIST_ITEM,
      payload: p.uuid
    });
  });

  it("ends hover", () => {
    const p = fakeProps();
    const wrapper = shallow(<GardenPlant {...p } />);
    wrapper.find("image").at(0).simulate("mouseLeave");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_PLANT_LIST_ITEM,
      payload: undefined
    });
  });

  it("has color", () => {
    const p = fakeProps();
    const wrapper = shallow(<GardenPlant {...p } />);
    expect(wrapper.find("image").props().filter).toEqual("");
  });

  it("has no color", () => {
    const p = fakeProps();
    p.grayscale = true;
    const wrapper = shallow(<GardenPlant {...p } />);
    expect(wrapper.find("image").props().filter).toEqual("url(#grayscale)");
  });
});
