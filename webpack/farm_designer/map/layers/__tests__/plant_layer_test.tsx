jest.mock("../../../../session", () => {
  return {
    Session: {
      getBool: () => { return false; }
    }
  };
});

import * as React from "react";
import { PlantLayer } from "../plant_layer";
import { shallow } from "enzyme";
import { fakePlant } from "../../../../__test_support__/fake_state/resources";
import { PlantLayerProps } from "../../interfaces";

describe("<PlantLayer/>", () => {
  function fakeProps(): PlantLayerProps {
    return {
      visible: true,
      plants: [fakePlant()],
      mapTransformProps: {
        quadrant: 2, gridSize: { x: 3000, y: 1500 }
      },
      currentPlant: undefined,
      dragging: false,
      editing: false,
      crops: [],
      dispatch: jest.fn(),
      zoomLvl: 1,
      activeDragXY: { x: undefined, y: undefined, z: undefined }
    };
  }

  it("shows plants", () => {
    const p = fakeProps();
    const wrapper = shallow(<PlantLayer {...p } />);
    const layer = wrapper.find("#plant-layer");
    expect(layer.find(".plant-link-wrapper").length).toEqual(1);
    expect(layer.html()).toContain("soil-cloud");
    expect(layer.html()).toContain("plant-icon");
    expect(layer.html()).toContain("image visibility=\"visible\"");
    expect(layer.html()).toContain("/app-resources/img/generic-plant.svg");
    expect(layer.html()).toContain("height=\"50\" width=\"50\" x=\"75\" y=\"175\"");
    expect(layer.html()).toContain("drag-helpers");
    expect(layer.html()).toContain("plant-icon");
  });

  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const wrapper = shallow(<PlantLayer {...p } />);
    expect(wrapper.html()).toEqual("<g id=\"plant-layer\"></g>");
  });
});
