let mockPath = "/app/designer/plants";
jest.mock("../../../../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
}));

import * as React from "react";
import { PointLayer, PointLayerProps } from "../point_layer";
import { fakePoint } from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import { GardenPoint } from "../garden_point";
import { svgMount } from "../../../../../__test_support__/svg_mount";

describe("<PointLayer/>", () => {
  const fakeProps = (): PointLayerProps => ({
    visible: true,
    genericPoints: [fakePoint()],
    mapTransformProps: fakeMapTransformProps(),
    hoveredPoint: undefined,
    dispatch: jest.fn(),
    interactions: true,
  });

  it("shows points", () => {
    const p = fakeProps();
    p.interactions = false;
    const wrapper = svgMount(<PointLayer {...p} />);
    const layer = wrapper.find("#point-layer");
    expect(layer.find(GardenPoint).html()).toContain("r=\"100\"");
    expect(layer.props().style).toEqual({ pointerEvents: "none" });
  });

  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const wrapper = svgMount(<PointLayer {...p} />);
    const layer = wrapper.find("#point-layer");
    expect(layer.find(GardenPoint).length).toEqual(0);
  });

  it("allows point mode interaction", () => {
    mockPath = "/app/designer/points";
    const p = fakeProps();
    p.interactions = true;
    const wrapper = svgMount(<PointLayer {...p} />);
    const layer = wrapper.find("#point-layer");
    expect(layer.props().style).toEqual({});
  });
});
