import React from "react";
import { Circle, CircleProps } from "../circle";
import { render } from "@testing-library/react";

describe("<Circle/>", () => {
  function fakeProps(): CircleProps {
    return {
      x: 10,
      y: 20,
      r: 30,
      selected: true
    };
  }

  it("renders selected plant indicator", () => {
    const { container } = render(<svg><Circle {...fakeProps()} /></svg>);
    const circle = container.querySelector("circle");
    if (!circle) { throw new Error("Missing circle"); }
    expect(Number(circle.getAttribute("cx"))).toEqual(10);
    expect(Number(circle.getAttribute("cy"))).toEqual(20);
    expect(Number(circle.getAttribute("r"))).toEqual(36);
  });

  it("hides selected plant indicator", () => {
    const p = fakeProps();
    p.selected = false;
    const { container } = render(<svg><Circle {...p} /></svg>);
    const circle = container.querySelector("circle");
    if (!circle) { throw new Error("Missing circle"); }
    expect(Number(circle.getAttribute("cx"))).toEqual(10);
    expect(Number(circle.getAttribute("cy"))).toEqual(20);
    expect(Number(circle.getAttribute("r"))).toEqual(0);
  });
});
