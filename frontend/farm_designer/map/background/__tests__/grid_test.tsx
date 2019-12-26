import * as React from "react";
import { Grid } from "../grid";
import { shallow } from "enzyme";
import { GridProps } from "../../interfaces";
import {
  fakeMapTransformProps
} from "../../../../__test_support__/map_transform_props";

describe("<Grid/>", () => {
  function fakeProps(): GridProps {
    return {
      mapTransformProps: fakeMapTransformProps(),
      zoomLvl: 1,
      onClick: jest.fn(),
      onMouseDown: jest.fn(),
    };
  }

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

  it("render default patterns strokes above 0.5 zoom", () => {
    const p = fakeProps();
    p.zoomLvl = 0.6;
    const wrapper = shallow(<Grid {...p} />);
    const minorGrid = wrapper.find("#minor_grid>path");
    const majorGrid = wrapper.find("#major_grid>path");
    const superiorGrid = wrapper.find("#superior_grid>path");
    expect(minorGrid.props()).toHaveProperty("stroke", "rgba(0, 0, 0, 0.15)");
    expect(majorGrid.props()).toHaveProperty("stroke", "rgba(0, 0, 0, 0.3)");
    expect(superiorGrid.props()).toHaveProperty("stroke", "rgba(0, 0, 0, 0.4)");
  });

  it("change patterns strokes on 0.5 zoom and below", () => {
    const p = fakeProps();
    p.zoomLvl = 0.5;
    const wrapper = shallow(<Grid {...p} />);
    const minorGrid = wrapper.find("#minor_grid>path");
    const majorGrid = wrapper.find("#major_grid>path");
    const superiorGrid = wrapper.find("#superior_grid>path");
    expect(minorGrid.props()).toHaveProperty("stroke", "rgba(0, 0, 0, 0)");
    expect(majorGrid.props()).toHaveProperty("stroke", "rgba(0, 0, 0, 0.6)");
    expect(superiorGrid.props()).toHaveProperty("stroke", "rgba(0, 0, 0, 0.8)");
  });
});
