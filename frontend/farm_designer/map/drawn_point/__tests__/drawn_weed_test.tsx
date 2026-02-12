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
    const { container } = svgMount(<DrawnWeed {...fakeProps()} />);
    const stop = container.querySelector("stop");
    const circle = container.querySelector("circle");
    expect(stop?.getAttribute("stop-color")).toEqual("green");
    expect(Number(stop?.getAttribute("stop-opacity"))).toEqual(0.25);
    expect(circle?.getAttribute("id")).toEqual("weed-radius");
    expect(Number(circle?.getAttribute("cx"))).toEqual(10);
    expect(Number(circle?.getAttribute("cy"))).toEqual(20);
    expect(Number(circle?.getAttribute("r"))).toEqual(30);
    expect(circle?.getAttribute("fill")).toEqual("url(#DrawnWeedGradient)");
  });

  it("renders pink weed", () => {
    const p = fakeProps();
    const weed = fakeDrawnPoint();
    weed.color = "pink";
    p.data = weed;
    const { container } = svgMount(<DrawnWeed {...p} />);
    const stop = container.querySelector("stop");
    expect(stop?.getAttribute("stop-color")).toEqual("pink");
    expect(Number(stop?.getAttribute("stop-opacity"))).toEqual(0.5);
  });

  it("doesn't render weed", () => {
    const p = fakeProps();
    p.data = undefined;
    const { container } = svgMount(<DrawnWeed {...p} />);
    expect(container.innerHTML).toContain("<g id=\"current-weed\"></g>");
  });
});
