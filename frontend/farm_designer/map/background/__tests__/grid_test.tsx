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
    templateView: false,
  });

  it("renders grid", () => {
    const expectedGridShape = { width: 3000, height: 1500 };
    const wrapper = shallow(<Grid {...fakeProps()} />);
    expect(wrapper.find("#major-grid").props()).toEqual(
      expect.objectContaining(expectedGridShape));
    expect(wrapper.find("#minor-grid").props()).toEqual(
      expect.objectContaining(expectedGridShape));
    expect(wrapper.find("#axis-arrows").find("line").first().props())
      .toEqual({ x1: 0, x2: 20, y1: 0, y2: 0 });
    expect(wrapper.find("#axis-values").find("TextInRoundedSvgBox").length)
      .toEqual(43);
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
    expect(wrapper.find("#x-label")).toHaveLength(xCount);
    expect(wrapper.find("#y-label")).toHaveLength(yCount);
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
      const wrapper = shallow(<Grid {...p} />);
      const xLabelNode = wrapper.find("#x-label").first();
      const yLabelNode = wrapper.find("#y-label").first();
      expect(xLabelNode.props().style?.transform).toEqual(xTransform);
      expect(yLabelNode.props().style?.transform).toEqual(yTransform);
      const xTextNodeProps = xLabelNode.find("TextInRoundedSvgBox").props();
      const yTextNodeProps = yLabelNode.find("TextInRoundedSvgBox").props();
      expect(xTextNodeProps.x).toEqual(xx);
      expect(xTextNodeProps.y).toEqual(xy);
      expect(yTextNodeProps.x).toEqual(yx);
      expect(yTextNodeProps.y).toEqual(yy);
    });
});
