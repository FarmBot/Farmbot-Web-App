import * as React from "react";
import { DrawnWeed, DrawnWeedProps } from "../drawn_weed";
import {
  fakeMapTransformProps,
} from "../../../../__test_support__/map_transform_props";
import { svgMount } from "../../../../__test_support__/svg_mount";

describe("<DrawnWeed />", () => {
  const fakeProps = (): DrawnWeedProps => ({
    mapTransformProps: fakeMapTransformProps(),
    data: {
      cx: 10,
      cy: 20,
      r: 30,
    }
  });

  it("renders weed", () => {
    const wrapper = svgMount(<DrawnWeed {...fakeProps()} />);
    const stop = wrapper.find("stop").first().props();
    expect(stop.stopColor).toEqual("red");
    expect(stop.stopOpacity).toEqual(0.25);
    expect(wrapper.find("circle").first().props()).toEqual({
      id: "weed-radius", cx: 10, cy: 20, r: 30, fill: "url(#DrawnWeedGradient)",
    });
  });

  it("renders point with chosen color", () => {
    const p = fakeProps();
    p.data = { cx: 0, cy: 0, r: 1, color: "orange" };
    const wrapper = svgMount(<DrawnWeed {...p} />);
    const stop = wrapper.find("stop").first().props();
    expect(stop.stopColor).toEqual("orange");
    expect(stop.stopOpacity).toEqual(0.5);
  });
});
