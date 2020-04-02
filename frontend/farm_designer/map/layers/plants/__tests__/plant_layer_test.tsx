let mockPath = "/app/designer/plants";
jest.mock("../../../../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/"))
}));

import * as React from "react";
import { PlantLayer } from "../plant_layer";
import {
  fakePlant, fakePlantTemplate,
} from "../../../../../__test_support__/fake_state/resources";
import { PlantLayerProps } from "../../../interfaces";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import { svgMount } from "../../../../../__test_support__/svg_mount";
import { shallow } from "enzyme";
import { GardenPlant } from "../garden_plant";

describe("<PlantLayer/>", () => {
  const fakeProps = (): PlantLayerProps => ({
    visible: true,
    plants: [fakePlant()],
    mapTransformProps: fakeMapTransformProps(),
    currentPlant: undefined,
    dragging: false,
    editing: false,
    boxSelected: undefined,
    groupSelected: [],
    dispatch: jest.fn(),
    zoomLvl: 1,
    activeDragXY: { x: undefined, y: undefined, z: undefined },
    animate: true,
    hoveredPlant: undefined,
    interactions: true,
  });

  it("shows plants", () => {
    const p = fakeProps();
    const wrapper = svgMount(<PlantLayer {...p} />);
    const layer = wrapper.find("#plant-layer");
    expect(layer.find(".plant-link-wrapper").length).toEqual(2);
    ["soil-cloud",
      "plant-icon",
      "image visibility=\"visible\"",
      "/app-resources/img/generic-plant.svg",
      "height=\"50\" width=\"50\" x=\"75\" y=\"175\"",
      "drag-helpers",
      "plant-icon",
    ].map(string =>
      expect(layer.html()).toContain(string));
  });

  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const wrapper = svgMount(<PlantLayer {...p} />);
    expect(wrapper.html()).toEqual("<svg><g id=\"plant-layer\"></g></svg>");
  });

  it("is in clickable mode", () => {
    mockPath = "/app/designer/plants";
    const p = fakeProps();
    p.interactions = true;
    p.plants[0].body.id = 1;
    const wrapper = svgMount(<PlantLayer {...p} />);
    expect(wrapper.find("Link").props().style).toEqual({
      cursor: "pointer"
    });
  });

  it("is in non-clickable mode", () => {
    mockPath = "/app/designer/plants/crop_search/mint/add";
    const p = fakeProps();
    p.interactions = false;
    p.plants[0].body.id = 1;
    const wrapper = svgMount(<PlantLayer {...p} />);
    expect(wrapper.find("Link").props().style)
      .toEqual({ pointerEvents: "none" });
  });

  it("has link to plant", () => {
    mockPath = "/app/designer/plants";
    const p = fakeProps();
    p.plants[0].body.id = 5;
    const wrapper = svgMount(<PlantLayer {...p} />);
    expect(wrapper.find("Link").props().to)
      .toEqual("/app/designer/plants/5");
  });

  it("has link to plant template", () => {
    mockPath = "/app/designer/plants";
    const p = fakeProps();
    p.plants = [fakePlantTemplate()];
    p.plants[0].body.id = 5;
    const wrapper = svgMount(<PlantLayer {...p} />);
    expect(wrapper.find("Link").props().to)
      .toEqual("/app/designer/gardens/templates/5");
  });

  it("has hovered plant", () => {
    mockPath = "/app/designer/plants";
    const p = fakeProps();
    const plant = fakePlant();
    p.plants = [plant];
    p.hoveredPlant = plant;
    const wrapper = shallow(<PlantLayer {...p} />);
    expect(wrapper.find(GardenPlant).props().hovered).toEqual(true);
  });

  it("has plant selected by selection box", () => {
    mockPath = "/app/designer/plants";
    const p = fakeProps();
    const plant = fakePlant();
    p.plants = [plant];
    p.boxSelected = [plant.uuid];
    const wrapper = svgMount(<PlantLayer {...p} />);
    expect(wrapper.find("GardenPlant").props().selected).toEqual(true);
  });

  it("doesn't allow clicking of unsaved plants", () => {
    const p = fakeProps();
    p.interactions = false;
    p.plants[0].body.id = 0;
    const wrapper = svgMount(<PlantLayer {...p} />);
    expect(wrapper.find("Link").props().style)
      .toEqual({ pointerEvents: "none" });
  });

  it("wraps the component in <g> (instead of <Link>", () => {
    mockPath = "/app/designer/groups/15";
    const p = fakeProps();
    const wrapper = svgMount(<PlantLayer {...p} />);
    expect(wrapper.find("a").length).toBe(0);
    expect(wrapper.find("g").length).toBeGreaterThan(0);
  });
});
