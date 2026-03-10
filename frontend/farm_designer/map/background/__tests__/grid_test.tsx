import React from "react";
import { Grid } from "../grid";
import { render } from "@testing-library/react";
import { GridProps } from "../../interfaces";
import {
  fakeMapTransformProps,
} from "../../../../__test_support__/map_transform_props";

describe("<Grid />", () => {
  const fakeProps = (): GridProps => ({
    mapTransformProps: fakeMapTransformProps(),
    zoomLvl: 1,
    onClick: jest.fn(),
    onMouseDown: jest.fn(),
    templateView: false,
  });

  const renderGrid = (props: GridProps) =>
    render(<svg><Grid {...props} /></svg>);

  const queryRequired = (
    container: HTMLElement,
    selector: string,
  ): HTMLElement => {
    const element = container.querySelector(selector);
    if (!element) { throw new Error(`Missing element: ${selector}`); }
    return element as HTMLElement;
  };

  const getNumericAttribute = (
    element: HTMLElement,
    attribute: string,
  ): number => {
    const value = element.getAttribute(attribute);
    if (value === undefined) {
      throw new Error(`Missing attribute ${attribute}`);
    }
    return Number(value);
  };

  it("renders grid", () => {
    const expectedGridShape = { width: 3000, height: 1500 };
    const { container } = renderGrid(fakeProps());
    const majorGrid = queryRequired(container, "#major-grid");
    const minorGrid = queryRequired(container, "#minor-grid");
    expect(getNumericAttribute(majorGrid, "width")).toEqual(
      expectedGridShape.width);
    expect(getNumericAttribute(majorGrid, "height")).toEqual(
      expectedGridShape.height);
    expect(getNumericAttribute(minorGrid, "width")).toEqual(
      expectedGridShape.width);
    expect(getNumericAttribute(minorGrid, "height")).toEqual(
      expectedGridShape.height);
    const axisArrow = queryRequired(container, "#axis-arrows line");
    expect(getNumericAttribute(axisArrow, "x1")).toEqual(0);
    expect(getNumericAttribute(axisArrow, "x2")).toEqual(20);
    expect(getNumericAttribute(axisArrow, "y1")).toEqual(0);
    expect(getNumericAttribute(axisArrow, "y2")).toEqual(0);
    expect(container.querySelectorAll("#axis-values #label").length)
      .toEqual(43);
  });

  it("renders grid: X&Y swapped", () => {
    const expectedGridShape = { width: 1500, height: 3000 };
    const p = fakeProps();
    p.mapTransformProps.xySwap = true;
    const { container } = renderGrid(p);
    const majorGrid = queryRequired(container, "#major-grid");
    const minorGrid = queryRequired(container, "#minor-grid");
    expect(getNumericAttribute(majorGrid, "width")).toEqual(
      expectedGridShape.width);
    expect(getNumericAttribute(majorGrid, "height")).toEqual(
      expectedGridShape.height);
    expect(getNumericAttribute(minorGrid, "width")).toEqual(
      expectedGridShape.width);
    expect(getNumericAttribute(minorGrid, "height")).toEqual(
      expectedGridShape.height);
  });

  it.each<[number, number, number, number]>([
    [0.6, 1, 2, 4],
    [0.5, 0, 3, 6],
  ])("render correct pattern strokes at zoom level: %s",
    (zoomLvl, minor, major, superior) => {
      const p = fakeProps();
      p.zoomLvl = zoomLvl;
      const { container } = renderGrid(p);
      const minorGrid = queryRequired(container, "#minor_grid > path");
      const majorGrid = queryRequired(container, "#major_grid > path");
      const superiorGrid = queryRequired(container, "#superior_grid > path");
      expect(getNumericAttribute(minorGrid, "stroke-width")).toEqual(minor);
      expect(getNumericAttribute(majorGrid, "stroke-width")).toEqual(major);
      expect(getNumericAttribute(superiorGrid, "stroke-width"))
        .toEqual(superior);
    });

  it.each<[number, number, number]>([
    [0.6, 29, 14],
    [0.5, 14, 7],
    [0.2, 5, 2],
  ])("visualizes axis values at zoom level: %s", (zoomLvl, xCount, yCount) => {
    const p = fakeProps();
    p.zoomLvl = zoomLvl;
    const { container } = renderGrid(p);
    expect(container.querySelectorAll("#x-label")).toHaveLength(xCount);
    expect(container.querySelectorAll("#y-label")).toHaveLength(yCount);
  });

  it.each<[
    number, number, boolean, number, number, number, number, string, string,
  ]>([
    [1.1, 2, false, 100, 0, 0, 100, "translate(0, -15px) scale(0.91)",
      "translate(-5px, -50%) rotate(-90deg) scale(0.91)"],
    [1, 2, true, 0, 100, 100, 0, "translate(-5px, -50%) rotate(-90deg) scale(1)",
      "translate(0, -15px) scale(1)"],
    [0.5, 1, false, 2800, 0, 3000, 200, "translate(0, -15px) scale(2)",
      "translate(5px, 50%) rotate(-90deg) scale(2)"],
    [0.25, 2, false, 200, 0, 0, 200, "translate(0, -15px) scale(4)",
      "translate(-5px, -50%) rotate(-90deg) scale(4)"],
    [0.15, 3, false, 500, 1500, 0, 1000, "translate(0, 15px) scale(6.67)",
      "translate(-5px, -50%) rotate(-90deg) scale(6.67)"],
    [0.1, 4, false, 2500, 1500, 3000, 1000, "translate(0, 15px) scale(10)",
      "translate(5px, 50%) rotate(-90deg) scale(10)"],
  ])("has correct transform for zoom level: %s",
    (zoomLvl, quadrant, xySwap, xx, xy, yx, yy, xTransform, yTransform) => {
      const p = fakeProps();
      p.zoomLvl = zoomLvl;
      p.mapTransformProps.quadrant = quadrant;
      p.mapTransformProps.xySwap = xySwap;
      const { container } = renderGrid(p);
      const xLabelNode = queryRequired(container, "#x-label");
      const yLabelNode = queryRequired(container, "#y-label");
      expect(xLabelNode.style.transform).toEqual(xTransform);
      expect(yLabelNode.style.transform).toEqual(yTransform);
      const xTextNode = queryRequired(xLabelNode, "text");
      const yTextNode = queryRequired(yLabelNode, "text");
      expect(getNumericAttribute(xTextNode, "x")).toEqual(xx);
      expect(getNumericAttribute(xTextNode, "y")).toEqual(xy);
      expect(getNumericAttribute(yTextNode, "x")).toEqual(yx);
      expect(getNumericAttribute(yTextNode, "y")).toEqual(yy);
    });
});
