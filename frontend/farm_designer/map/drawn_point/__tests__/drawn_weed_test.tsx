import React from "react";
import { DrawnWeed, DrawnWeedProps } from "../drawn_weed";
import {
  fakeMapTransformProps,
} from "../../../../__test_support__/map_transform_props";
import { svgMount } from "../../../../__test_support__/svg_mount";
import { fakeDrawnPoint } from "../../../../__test_support__/fake_designer_state";

describe("<DrawnWeed />", () => {
  const fakeProps = (): DrawnWeedProps => ({
    mapTransformProps: fakeMapTransformProps(),
    data: fakeDrawnPoint(),
  });

  it("renders weed", () => {
    const wrapper = svgMount(<DrawnWeed {...fakeProps()} />);
    const stop = wrapper.find("stop").first().props();
    expect(stop.stopColor).toEqual("green");
    expect(stop.stopOpacity).toEqual(0.25);
    expect(wrapper.find("circle").first().props()).toEqual({
      id: "weed-radius", cx: 10, cy: 20, r: 30, fill: "url(#DrawnWeedGradient)",
    });
  });

  it("renders pink weed", () => {
    const p = fakeProps();
    const weed = fakeDrawnPoint();
    weed.color = "pink";
    p.data = weed;
    const wrapper = svgMount(<DrawnWeed {...p} />);
    const stop = wrapper.find("stop").first().props();
    expect(stop.stopColor).toEqual("pink");
    expect(stop.stopOpacity).toEqual(0.5);
  });

  it("doesn't render weed", () => {
    const p = fakeProps();
    p.data = undefined;
    const wrapper = svgMount(<DrawnWeed {...p} />);
    expect(wrapper.html()).toContain("<g id=\"current-weed\"></g>");
  });
});
