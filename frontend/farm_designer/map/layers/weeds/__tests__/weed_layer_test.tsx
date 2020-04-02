let mockPath = "/app/designer/plants";
jest.mock("../../../../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
}));

import * as React from "react";
import { WeedLayer, WeedLayerProps } from "../weed_layer";
import { fakeWeed } from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import { GardenWeed } from "../garden_weed";
import { svgMount } from "../../../../../__test_support__/svg_mount";

describe("<WeedLayer/>", () => {
  const fakeProps = (): WeedLayerProps => ({
    visible: true,
    spreadVisible: true,
    weeds: [fakeWeed()],
    mapTransformProps: fakeMapTransformProps(),
    hoveredPoint: undefined,
    dispatch: jest.fn(),
    currentPoint: undefined,
    boxSelected: undefined,
    groupSelected: [],
    animate: false,
    interactions: true,
  });

  it("shows weeds", () => {
    const p = fakeProps();
    p.interactions = false;
    const wrapper = svgMount(<WeedLayer {...p} />);
    const layer = wrapper.find("#weeds-layer");
    expect(layer.find(GardenWeed).html()).toContain("r=\"100\"");
    expect(layer.props().style).toEqual({ pointerEvents: "none" });
  });

  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const wrapper = svgMount(<WeedLayer {...p} />);
    const layer = wrapper.find("#weeds-layer");
    expect(layer.find(GardenWeed).length).toEqual(0);
  });

  it("allows weed mode interaction", () => {
    mockPath = "/app/designer/weeds";
    const p = fakeProps();
    p.interactions = true;
    const wrapper = svgMount(<WeedLayer {...p} />);
    const layer = wrapper.find("#weeds-layer");
    expect(layer.props().style).toEqual({ cursor: "pointer" });
  });

  it("is selected", () => {
    mockPath = "/app/designer/weeds";
    const p = fakeProps();
    const weed = fakeWeed();
    p.weeds = [weed];
    p.boxSelected = [weed.uuid];
    const wrapper = svgMount(<WeedLayer {...p} />);
    const layer = wrapper.find("#weeds-layer");
    expect(layer.find(GardenWeed).props().selected).toBeTruthy();
  });
});
