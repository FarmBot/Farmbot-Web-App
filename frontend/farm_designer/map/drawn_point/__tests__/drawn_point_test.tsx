import React from "react";
import { DrawnPoint, DrawnPointProps } from "../drawn_point";
import {
  fakeMapTransformProps,
} from "../../../../__test_support__/map_transform_props";
import { svgMount } from "../../../../__test_support__/svg_mount";
import { fakeDrawnPoint } from "../../../../__test_support__/fake_designer_state";

describe("<DrawnPoint/>", () => {
  const fakeProps = (): DrawnPointProps => ({
    mapTransformProps: fakeMapTransformProps(),
    data: fakeDrawnPoint(),
  });

  it("renders point", () => {
    const wrapper = svgMount(<DrawnPoint {...fakeProps()} />);
    expect(wrapper.find("g").props().stroke).toEqual("green");
    expect(wrapper.find("circle").first().props()).toEqual({
      id: "point-radius", strokeDasharray: "4 5",
      cx: 10, cy: 20, r: 30,
    });
    expect(wrapper.find("circle").last().props()).toEqual({
      id: "point-center",
      cx: 10, cy: 20, r: 2,
    });
  });

  it("doesn't render point", () => {
    const p = fakeProps();
    p.data = undefined;
    const wrapper = svgMount(<DrawnPoint {...p} />);
    expect(wrapper.html()).toContain("<g id=\"current-point\"></g>");
  });
});
