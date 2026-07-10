import React from "react";
import { render } from "@testing-library/react";
import {
  buildXAxisBeltPath, buildYAxisBeltPath, buildZAxisBeltPath,
  XAxisBelt, YAxisBelt,
} from "../belts";

describe("belts", () => {
  it.each([0, 700, 1230])("builds routes at axis position %s", position => {
    expect(buildXAxisBeltPath("v1.9", 500, 2987, position)
      .getSegments()).not.toHaveLength(0);
    expect(buildYAxisBeltPath("v1.9", 1500, 1230, position)
      .getSegments()).not.toHaveLength(0);
    expect(buildZAxisBeltPath(1230, 500, position, -200)
      .getSegments()).not.toHaveLength(0);
  });

  it("renders the Y-axis belt as separate segments", () => {
    const { container, rerender } = render(<YAxisBelt
      beamLength={1500}
      botSizeY={1230}
      y={700}
      position={[1, 2, 3]} />);

    expect(container.querySelector("group")?.getAttribute("name"))
      .toEqual("yBelt");
    expect(container.querySelector("group")?.getAttribute("position"))
      .toContain("1,2,3");
    expect(container.querySelectorAll(".extrude")).toHaveLength(7);
    expect(container).toContainHTML("yBeltSegment0");

    rerender(<YAxisBelt
      beamLength={1500}
      botSizeY={1230}
      y={701}
      position={[1, 2, 3]} />);
    expect(container.querySelectorAll(".extrude")).toHaveLength(7);
  });

  it.each(["x1Belt", "x2Belt"] as const)("renders %s", name => {
    const { container } = render(<XAxisBelt
      name={name}
      position={[4, 5, 6]}
      length={2987}
      x={300}
      columnLength={500} />);

    expect(container.querySelector("group")?.getAttribute("name"))
      .toEqual(name);
    expect(container.querySelectorAll(".extrude")).toHaveLength(7);
    expect(container).toContainHTML(`${name}Segment6`);
  });
});
