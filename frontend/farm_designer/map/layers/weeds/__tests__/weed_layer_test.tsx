import React from "react";
import { WeedLayer, WeedLayerProps } from "../weed_layer";
import { fakeWeed } from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import { svgMount } from "../../../../../__test_support__/svg_mount";
import { Path } from "../../../../../internal_urls";

describe("<WeedLayer/>", () => {
  const fakeProps = (): WeedLayerProps => ({
    visible: true,
    radiusVisible: true,
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
    expect(layer.find("#weed-radius").length).toEqual(1);
    const style = layer.props().style as
      | string
      | { pointerEvents?: string }
      | undefined;
    if (typeof style == "string") {
      expect(style).toContain("pointer-events: none");
    } else {
      expect(style?.pointerEvents).toEqual("none");
    }
  });

  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const wrapper = svgMount(<WeedLayer {...p} />);
    const layer = wrapper.find("#weeds-layer");
    expect(layer.find(".map-weed").length).toEqual(0);
  });

  it("allows weed mode interaction", () => {
    location.pathname = Path.mock(Path.weeds());
    const p = fakeProps();
    p.interactions = true;
    const wrapper = svgMount(<WeedLayer {...p} />);
    const layer = wrapper.find("#weeds-layer");
    const style = layer.props().style as
      | string
      | { cursor?: string }
      | undefined;
    if (typeof style == "string") {
      expect(style).toContain("cursor: pointer");
    } else {
      expect(style?.cursor).toEqual("pointer");
    }
  });

  it("is selected", () => {
    location.pathname = Path.mock(Path.weeds());
    const p = fakeProps();
    const weed = fakeWeed();
    p.weeds = [weed];
    p.boxSelected = [weed.uuid];
    const wrapper = svgMount(<WeedLayer {...p} />);
    const layer = wrapper.find("#weeds-layer");
    expect(layer.find("#selected-weed-indicator").length).toEqual(1);
  });
});
