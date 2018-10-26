import * as React from "react";
import {
  SpreadOverlapHelper,
  getDiscreteColor,
  getContinuousColor,
  getRadius,
  SpreadOption,
  getOverlap,
  overlapText
} from "../spread_overlap_helper";
import { shallow } from "enzyme";
import { SpreadOverlapHelperProps } from "../../../interfaces";
import { fakePlant } from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps
} from "../../../../../__test_support__/map_transform_props";

describe("<SpreadOverlapHelper/>", () => {
  function fakeProps(): SpreadOverlapHelperProps {
    const plant = fakePlant();
    plant.body.x = 100;
    plant.body.y = 100;
    plant.body.radius = 25;
    return {
      mapTransformProps: fakeMapTransformProps(),
      plant,
      dragging: false,
      zoomLvl: 1,
      activeDragXY: { x: undefined, y: undefined, z: undefined },
      activeDragSpread: 250
    };
  }

  it("renders no overlap indicator: 0%", () => {
    const p = fakeProps();
    p.activeDragXY = { x: 1000, y: 100, z: 0 };
    // Center distance: 900mm (inactive plant at x=100, y=100)
    // Overlap: -650mm (default spread = radius * 10 = 250mm)
    // Percentage overlap of inactive plant: 0%
    const wrapper = shallow(<SpreadOverlapHelper {...p} />);
    const indicator = wrapper.find(".overlap-circle").props();
    expect(indicator.fill).toEqual("none");
  });

  it("renders gray overlap indicator: 4%", () => {
    const p = fakeProps();
    p.activeDragXY = { x: 340, y: 100, z: 0 };
    // Center distance: 240mm (inactive plant at x=100, y=100)
    // Overlap: 10mm (default spread = radius * 10 = 250mm)
    // Percentage overlap of inactive plant: 4%
    const wrapper = shallow(<SpreadOverlapHelper {...p} />);
    const indicator = wrapper.find(".overlap-circle").props();
    expect(indicator.fill).toEqual("rgba(41, 141, 0, 0.04)"); // "green"
  });

  it("renders yellow overlap indicator: 20%", () => {
    const p = fakeProps();
    p.activeDragXY = { x: 300, y: 100, z: 0 };
    // Center distance: 200mm (inactive plant at x=100, y=100)
    // Overlap: 50mm (default spread = radius * 10 = 250mm)
    // Percentage overlap of inactive plant: 20%
    const wrapper = shallow(<SpreadOverlapHelper {...p} />);
    const indicator = wrapper.find(".overlap-circle").props();
    expect(indicator.fill).toEqual("rgba(204, 255, 0, 0.2)"); // "yellow"
  });

  it("renders orange overlap indicator: 40%", () => {
    const p = fakeProps();
    p.activeDragXY = { x: 250, y: 100, z: 0 };
    // Center distance: 150mm (inactive plant at x=100, y=100)
    // Overlap: 100mm (default spread = radius * 10 = 250mm)
    // Percentage overlap of inactive plant: 40%
    const wrapper = shallow(<SpreadOverlapHelper {...p} />);
    const indicator = wrapper.find(".overlap-circle").props();
    expect(indicator.fill).toEqual("rgba(255, 102, 0, 0.3)"); // "orange"
  });

  it("renders red overlap indicator: 50%", () => {
    const p = fakeProps();
    p.activeDragXY = { x: 225, y: 100, z: 0 };
    // Center distance: 125mm (inactive plant at x=100, y=100)
    // Overlap: 125mm (default spread = radius * 10 = 250mm)
    // Percentage overlap of inactive plant: 50%
    const wrapper = shallow(<SpreadOverlapHelper {...p} />);
    const indicator = wrapper.find(".overlap-circle").props();
    expect(indicator.fill).toEqual("rgba(255, 20, 0, 0.3)"); // "red"
  });

  it("renders red overlap indicator: 80%", () => {
    const p = fakeProps();
    p.activeDragXY = { x: 150, y: 100, z: 0 };
    // Center distance: 50mm (inactive plant at x=100, y=100)
    // Overlap: 200mm (default spread = radius * 10 = 250mm)
    // Percentage overlap of inactive plant: 80%
    const wrapper = shallow(<SpreadOverlapHelper {...p} />);
    const indicator = wrapper.find(".overlap-circle").props();
    expect(indicator.fill).toEqual("rgba(255, 0, 0, 0.3)"); // "red"
  });

  it("renders red overlap indicator: 100%", () => {
    const p = fakeProps();
    p.activeDragXY = { x: 100, y: 100, z: 0 };
    // Center distance: 0mm (inactive plant at x=100, y=100)
    // Overlap: 250mm (default spread = radius * 10 = 250mm)
    // Percentage overlap of inactive plant: 100%
    const wrapper = shallow(<SpreadOverlapHelper {...p} />);
    const indicator = wrapper.find(".overlap-circle").props();
    expect(indicator.fill).toEqual("rgba(255, 0, 0, 0.3)"); // "red"
  });

});

describe("SpreadOverlapHelper functions", () => {

  it("getDiscreteColor()", () => {
    expect(getDiscreteColor(10, 100)).toEqual("green");
    expect(getDiscreteColor(20, 100)).toEqual("green");
  });

  it("getContinuousColor()", () => {
    expect(getContinuousColor(10, 100)).toEqual("rgba(51, 151, 0, 0.05)");
    expect(getContinuousColor(20, 100)).toEqual("rgba(102, 202, 0, 0.1)");
  });

  it("getRadius()", () => {
    const spreadData = { active: 100, inactive: 200 };
    expect(getRadius(SpreadOption.ActivePlant, spreadData)).toEqual(100);
    expect(getRadius(SpreadOption.InactivePlant, spreadData)).toEqual(200);
    expect(getRadius(SpreadOption.WorseCase, spreadData)).toEqual(100);
    expect(getRadius(SpreadOption.LesserCase, spreadData)).toEqual(200);
  });

  it("getOverlap()", () => {
    const activePlant = { x: 50, y: 50, z: 0 };
    const inactivePlant = { x: 50, y: 300, z: 0 };
    const spreadData = { active: 100, inactive: 200 };
    expect(getOverlap(activePlant, inactivePlant, spreadData)).toEqual(50);
  });

  it("overlapText()", () => {
    const spreadData = { active: 100, inactive: 200 };
    const svgText = shallow(overlapText(100, 100, 150, spreadData));
    ["Active: 80%", "Inactive: 40%", "orange"].map(string =>
      expect(svgText.text()).toContain(string));
  });

});
