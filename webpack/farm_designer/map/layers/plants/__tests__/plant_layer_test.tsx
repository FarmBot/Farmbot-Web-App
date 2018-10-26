let mockPath = "/app/designer/plants";
jest.mock("../../../../../history", () => ({
  getPathArray: jest.fn(() => { return mockPath.split("/"); })
}));

import * as React from "react";
import { PlantLayer } from "../plant_layer";
import { shallow } from "enzyme";
import {
  fakePlant, fakePlantTemplate
} from "../../../../../__test_support__/fake_state/resources";
import { PlantLayerProps, GardenPlantProps } from "../../../interfaces";
import {
  fakeMapTransformProps
} from "../../../../../__test_support__/map_transform_props";

describe("<PlantLayer/>", () => {
  function fakeProps(): PlantLayerProps {
    return {
      visible: true,
      plants: [fakePlant()],
      mapTransformProps: fakeMapTransformProps(),
      currentPlant: undefined,
      dragging: false,
      editing: false,
      selectedForDel: undefined,
      crops: [],
      dispatch: jest.fn(),
      zoomLvl: 1,
      activeDragXY: { x: undefined, y: undefined, z: undefined },
      animate: true,
    };
  }

  it("shows plants", () => {
    const p = fakeProps();
    const wrapper = shallow(<PlantLayer {...p} />);
    const layer = wrapper.find("#plant-layer");
    expect(layer.find(".plant-link-wrapper").length).toEqual(1);
    ["soil-cloud",
      "plant-icon",
      "image visibility=\"visible\"",
      "/app-resources/img/generic-plant.svg",
      "height=\"50\" width=\"50\" x=\"75\" y=\"175\"",
      "drag-helpers",
      "plant-icon"
    ].map(string =>
      expect(layer.html()).toContain(string));
  });

  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const wrapper = shallow(<PlantLayer {...p} />);
    expect(wrapper.html()).toEqual("<g id=\"plant-layer\"></g>");
  });

  it("is in clickable mode", () => {
    mockPath = "/app/designer/plants";
    const p = fakeProps();
    const wrapper = shallow(<PlantLayer {...p} />);
    expect(wrapper.find("Link").props().style).toEqual({});
  });

  it("is in non-clickable mode", () => {
    mockPath = "/app/designer/plants/select";
    const p = fakeProps();
    const wrapper = shallow(<PlantLayer {...p} />);
    expect(wrapper.find("Link").props().style)
      .toEqual({ pointerEvents: "none" });
  });

  it("has link to plant", () => {
    mockPath = "/app/designer/plants";
    const p = fakeProps();
    p.plants[0].body.id = 5;
    const wrapper = shallow(<PlantLayer {...p} />);
    expect(wrapper.find("Link").props().to)
      .toEqual("/app/designer/plants/5");
  });

  it("has link to plant template", () => {
    mockPath = "/app/designer/plants";
    const p = fakeProps();
    p.plants = [fakePlantTemplate()];
    p.plants[0].body.id = 5;
    const wrapper = shallow(<PlantLayer {...p} />);
    expect(wrapper.find("Link").props().to)
      .toEqual("/app/designer/saved_gardens/templates/5");
  });

  it("has selected plant", () => {
    mockPath = "/app/designer/plants";
    const p = fakeProps();
    const plant = fakePlant();
    p.plants = [plant];
    p.currentPlant = plant;
    const wrapper = shallow(<PlantLayer {...p} />);
    expect(wrapper.find("GardenPlant").props().selected).toEqual(true);
  });

  it("has plant selected for deletion", () => {
    mockPath = "/app/designer/plants";
    const p = fakeProps();
    const plant = fakePlant();
    p.plants = [plant];
    p.selectedForDel = [plant.uuid];
    const wrapper = shallow(<PlantLayer {...p} />);
    expect((wrapper.find("GardenPlant").props() as GardenPlantProps).grayscale)
      .toEqual(true);
  });
});
