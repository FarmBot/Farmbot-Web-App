import * as React from "react";
import { DrawnPoint, DrawnPointProps } from "../drawn_point";
import {
  fakeMapTransformProps,
} from "../../../../__test_support__/map_transform_props";
import { svgMount } from "../../../../__test_support__/svg_mount";

describe("<DrawnPoint/>", () => {
  const fakeProps = (): DrawnPointProps => ({
    mapTransformProps: fakeMapTransformProps(),
    data: {
      cx: 10,
      cy: 20,
      r: 30,
    }
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

  it("renders point with chosen color", () => {
    const p = fakeProps();
    p.data = { cx: 0, cy: 0, r: 1, color: "red" };
    const wrapper = svgMount(<DrawnPoint {...p} />);
    expect(wrapper.find("g").props().stroke).toEqual("red");
  });
});
