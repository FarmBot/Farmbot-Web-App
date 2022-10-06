import React from "react";
import { Grid } from "../grid";
import { shallow } from "enzyme";
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
  });

  it("renders grid", () => {
    const expectedGridShape = { width: 3000, height: 1500 };
    const wrapper = shallow(<Grid {...fakeProps()} />);
    expect(wrapper.find("#major-grid").props()).toEqual(
      expect.objectContaining(expectedGridShape));
    expect(wrapper.find("#minor-grid").props()).toEqual(
      expect.objectContaining(expectedGridShape));
    expect(wrapper.find("#axis-arrows").find("line").first().props())
      .toEqual({ x1: 0, x2: 25, y1: 0, y2: 0 });
    expect(wrapper.find("#axis-values").find("text").length).toEqual(43);
  });

  it("renders grid: X&Y swapped", () => {
    const expectedGridShape = { width: 1500, height: 3000 };
    const p = fakeProps();
    p.mapTransformProps.xySwap = true;
    const wrapper = shallow(<Grid {...p} />);
    expect(wrapper.find("#major-grid").props()).toEqual(
      expect.objectContaining(expectedGridShape));
    expect(wrapper.find("#minor-grid").props()).toEqual(
      expect.objectContaining(expectedGridShape));
  });

  it.each<[number, number, number, number]>([
    [0.6, 1, 2, 4],
    [0.5, 0, 3, 6],
  ])("render correct pattern strokes at zoom level: %s",
    (zoomLvl, minor, major, superior) => {
      const p = fakeProps();
      p.zoomLvl = zoomLvl;
      const wrapper = shallow(<Grid {...p} />);
      const minorGrid = wrapper.find("#minor_grid>path");
      const majorGrid = wrapper.find("#major_grid>path");
      const superiorGrid = wrapper.find("#superior_grid>path");
      expect(minorGrid.props()).toHaveProperty("strokeWidth", minor);
      expect(majorGrid.props()).toHaveProperty("strokeWidth", major);
      expect(superiorGrid.props()).toHaveProperty("strokeWidth", superior);
    });

  it.each<[number, number, number]>([
    [0.6, 29, 14],
    [0.5, 14, 7],
    [0.2, 5, 2],
  ])("visualizes axis values at zoom level: %s", (zoomLvl, xCount, yCount) => {
    const p = fakeProps();
    p.zoomLvl = zoomLvl;
    const wrapper = shallow(<Grid {...p} />);
    const xAxisValues = wrapper.find("#x-label").children();
    const yAxisValues = wrapper.find("#y-label").children();
    expect(xAxisValues).toHaveLength(xCount);
    expect(yAxisValues).toHaveLength(yCount);
  });

  it.each<[number, number, number, number, number, string, string]>([
    [1.1, 100, -10, -10, 100, "scale(0.91) ", "scale(0.91) rotate(-90deg)"],
    [0.5, 200, -20, -20, 200, "scale(2) ", "scale(2) rotate(-90deg)"],
    [0.1, 500, -100, -100, 500, "scale(10) ", "scale(10) rotate(-90deg)"],
  ])("has correct transform for zoom level: %s",
    (zoomLvl, xx, xy, yx, yy, xTransform, yTransform) => {
      const p = fakeProps();
      p.zoomLvl = zoomLvl;
      const wrapper = shallow(<Grid {...p} />);
      const xTextNodeProps = wrapper.find("#x-label").first().props();
      const yTextNodeProps = wrapper.find("#y-label").first().props();
      expect(xTextNodeProps.style?.transform).toEqual(xTransform);
      expect(yTextNodeProps.style?.transform).toEqual(yTransform);
      expect(xTextNodeProps.x).toEqual(xx);
      expect(xTextNodeProps.y).toEqual(xy);
      expect(yTextNodeProps.x).toEqual(yx);
      expect(yTextNodeProps.y).toEqual(yy);
    });
});
