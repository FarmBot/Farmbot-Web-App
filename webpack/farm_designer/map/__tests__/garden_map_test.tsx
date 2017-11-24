jest.mock("../../../history", () => ({
  getPathArray: () => {
    return "/app/designer/plants/crop_search/aplant/add".split("/");
  }
}));

jest.mock("../../../open_farm/icons", () => ({
  cachedCrop: jest.fn(() => { return Promise.resolve({ spread: 100 }); })
}));

import * as React from "react";
import { GardenMap } from "../garden_map";
import { shallow } from "enzyme";
import { GardenMapProps } from "../../interfaces";
import { fakePlant } from "../../../__test_support__/fake_state/resources";

describe("<GardenPlant/>", () => {
  function fakeProps(): GardenMapProps {
    return {
      showPoints: true,
      showPlants: true,
      showSpread: false,
      showFarmbot: false,
      selectedPlant: fakePlant(),
      crops: [],
      dispatch: jest.fn(),
      designer: {
        selectedPlants: undefined,
        hoveredPlant: {
          plantUUID: "",
          icon: ""
        },
        cropSearchQuery: "",
        cropSearchResults: []
      },
      plants: [],
      points: [],
      toolSlots: [],
      botLocationData: {
        position: { x: 0, y: 0, z: 0 },
        scaled_encoders: { x: undefined, y: undefined, z: undefined },
        raw_encoders: { x: undefined, y: undefined, z: undefined },
      },
      botSize: {
        x: { value: 3000, isDefault: true },
        y: { value: 1500, isDefault: true }
      },
      stopAtHome: { x: true, y: true },
      hoveredPlant: fakePlant(),
      zoomLvl: 1,
      botOriginQuadrant: 2,
      gridSize: { x: 1000, y: 1000 },
      gridOffset: { x: 100, y: 100 },
      peripherals: [],
      eStopStatus: false
    };
  }

  it("adds plant", () => {
    const wrapper = shallow(<GardenMap {...fakeProps() } />);
    const add = () =>
      wrapper.find("#drop-area-svg").simulate("click", { preventDefault: jest.fn() });
    expect(add).toThrow(/while trying to add a plant./);
    // This action will successfully add a plant when in-app. `Throw` is used here
    // because `document.querySelector(` doesn't work while testing. Effectively,
    // this test checks that the function to add a plant is run.
  });

  it("starts drag and sets activeSpread", async () => {
    const wrapper = shallow(<GardenMap {...fakeProps() } />);
    expect(wrapper.state()).toEqual({});
    Object.defineProperty(location, "pathname", {
      value: "/edit/"
    });
    await wrapper.find("#drop-area-svg").simulate("mouseDown");
    expect(wrapper.state()).toEqual({
      activeDragSpread: 1000,
      isDragging: true
    });
  });

  it("ends drag", () => {
    const wrapper = shallow(<GardenMap {...fakeProps() } />);
    expect(wrapper.state()).toEqual({});
    wrapper.find("#drop-area-svg").simulate("mouseUp");
    expect(wrapper.state()).toEqual({
      "activeDragSpread": undefined,
      "activeDragXY": { "x": undefined, "y": undefined, "z": undefined },
      "isDragging": false,
      "pageX": 0,
      "pageY": 0
    });
  });

});
