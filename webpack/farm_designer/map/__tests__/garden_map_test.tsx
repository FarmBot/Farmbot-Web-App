jest.mock("../../../history", () => ({
  history: {
    getCurrentLocation: () => {
      return { pathname: "//////add" };
    }
  }
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
      selectedPlant: undefined,
      crops: [],
      dispatch: jest.fn(),
      designer: {
        selectedPlant: "",
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
      botPosition: { x: 0, y: 0, z: 0 },
      botSize: {
        x: { value: 3000, isDefault: true },
        y: { value: 1500, isDefault: true }
      },
      stopAtHome: { x: true, y: true },
      hoveredPlant: fakePlant(),
      zoomLvl: 1,
      botOriginQuadrant: 2,
      gridSize: { x: 1000, y: 1000 },
      gridOffset: { x: 100, y: 100 }
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

});
