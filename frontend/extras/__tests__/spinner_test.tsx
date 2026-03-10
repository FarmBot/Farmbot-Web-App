import React from "react";
import { Spinner } from "../spinner";
import { render } from "@testing-library/react";

describe("spinner", () => {
  it("renders defaults", () => {
    const { container } = render(<Spinner />);
    const circle = container.querySelector("circle");
    const svg = container.querySelector("svg");
    expect(circle?.getAttribute("cx")).toEqual("10");
    expect(circle?.getAttribute("stroke-width")).toEqual("3");
    expect(svg?.getAttribute("viewBox")).toEqual("0 0 20.5 20.5");
  });

  it("renders inputs", () => {
    const { container } = render(<Spinner radius={50} strokeWidth={5} wobble={1} />);
    const circle = container.querySelector("circle");
    const svg = container.querySelector("svg");
    expect(circle?.getAttribute("cx")).toEqual("50");
    expect(circle?.getAttribute("stroke-width")).toEqual("5");
    expect(svg?.getAttribute("viewBox")).toEqual("0 0 101 101");
  });
});
