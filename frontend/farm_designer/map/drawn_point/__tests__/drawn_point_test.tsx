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
    const group = wrapper.container.querySelector("g");
    const circles = wrapper.container.querySelectorAll("circle");
    const firstCircle = circles.item(0);
    const lastCircle = circles.item(circles.length - 1);
    expect(group?.getAttribute("stroke")).toEqual("green");
    expect(firstCircle?.getAttribute("id")).toEqual("point-radius");
    expect(firstCircle?.getAttribute("stroke-dasharray")).toEqual("4 5");
    expect(firstCircle?.getAttribute("cx")).toEqual("10");
    expect(firstCircle?.getAttribute("cy")).toEqual("20");
    expect(firstCircle?.getAttribute("r")).toEqual("30");
    expect(lastCircle?.getAttribute("id")).toEqual("point-center");
    expect(lastCircle?.getAttribute("cx")).toEqual("10");
    expect(lastCircle?.getAttribute("cy")).toEqual("20");
    expect(lastCircle?.getAttribute("r")).toEqual("2");
  });

  it("doesn't render point", () => {
    const p = fakeProps();
    p.data = undefined;
    const wrapper = svgMount(<DrawnPoint {...p} />);
    expect(wrapper.container.innerHTML).toContain("<g id=\"current-point\"></g>");
  });
});
