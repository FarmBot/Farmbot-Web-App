import * as React from "react";
import { SpreadOverlapHelper } from "../spread_overlap_helper";
import { shallow } from "enzyme";
import { SpreadOverlapHelperProps } from "../interfaces";
import { fakePlant } from "../../../__test_support__/fake_state/resources";

describe("<SpreadOverlapHelper/>", () => {
  function fakeProps(): SpreadOverlapHelperProps {
    const plant = fakePlant();
    plant.body.x = 100;
    plant.body.y = 100;
    plant.body.radius = 25;
    return {
      mapTransformProps: {
        quadrant: 2, gridSize: { x: 3000, y: 1500 }
      },
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
    const wrapper = shallow(<SpreadOverlapHelper {...p } />);
    const indicator = wrapper.find(".overlap-circle").props();
    expect(indicator.fill).toEqual("none");
  });

  it("renders gray overlap indicator: 4%", () => {
    const p = fakeProps();
    p.activeDragXY = { x: 340, y: 100, z: 0 };
    // Center distance: 240mm (inactive plant at x=100, y=100)
    // Overlap: 10mm (default spread = radius * 10 = 250mm)
    // Percentage overlap of inactive plant: 4%
    const wrapper = shallow(<SpreadOverlapHelper {...p } />);
    const indicator = wrapper.find(".overlap-circle").props();
    expect(indicator.fill).toEqual("rgba(41, 141, 0, 0.04)"); // "green"
  });

  it("renders yellow overlap indicator: 20%", () => {
    const p = fakeProps();
    p.activeDragXY = { x: 300, y: 100, z: 0 };
    // Center distance: 200mm (inactive plant at x=100, y=100)
    // Overlap: 50mm (default spread = radius * 10 = 250mm)
    // Percentage overlap of inactive plant: 20%
    const wrapper = shallow(<SpreadOverlapHelper {...p } />);
    const indicator = wrapper.find(".overlap-circle").props();
    expect(indicator.fill).toEqual("rgba(204, 255, 0, 0.2)"); // "yellow"
  });

  it("renders orange overlap indicator: 40%", () => {
    const p = fakeProps();
    p.activeDragXY = { x: 250, y: 100, z: 0 };
    // Center distance: 150mm (inactive plant at x=100, y=100)
    // Overlap: 100mm (default spread = radius * 10 = 250mm)
    // Percentage overlap of inactive plant: 40%
    const wrapper = shallow(<SpreadOverlapHelper {...p } />);
    const indicator = wrapper.find(".overlap-circle").props();
    expect(indicator.fill).toEqual("rgba(255, 102, 0, 0.3)"); // "orange"
  });

  it("renders red overlap indicator: 50%", () => {
    const p = fakeProps();
    p.activeDragXY = { x: 225, y: 100, z: 0 };
    // Center distance: 125mm (inactive plant at x=100, y=100)
    // Overlap: 125mm (default spread = radius * 10 = 250mm)
    // Percentage overlap of inactive plant: 50%
    const wrapper = shallow(<SpreadOverlapHelper {...p } />);
    const indicator = wrapper.find(".overlap-circle").props();
    expect(indicator.fill).toEqual("rgba(255, 20, 0, 0.3)"); // "red"
  });

  it("renders red overlap indicator: 80%", () => {
    const p = fakeProps();
    p.activeDragXY = { x: 150, y: 100, z: 0 };
    // Center distance: 50mm (inactive plant at x=100, y=100)
    // Overlap: 200mm (default spread = radius * 10 = 250mm)
    // Percentage overlap of inactive plant: 80%
    const wrapper = shallow(<SpreadOverlapHelper {...p } />);
    const indicator = wrapper.find(".overlap-circle").props();
    expect(indicator.fill).toEqual("rgba(255, 0, 0, 0.3)"); // "red"
  });

  it("renders red overlap indicator: 100%", () => {
    const p = fakeProps();
    p.activeDragXY = { x: 100, y: 100, z: 0 };
    // Center distance: 0mm (inactive plant at x=100, y=100)
    // Overlap: 250mm (default spread = radius * 10 = 250mm)
    // Percentage overlap of inactive plant: 100%
    const wrapper = shallow(<SpreadOverlapHelper {...p } />);
    const indicator = wrapper.find(".overlap-circle").props();
    expect(indicator.fill).toEqual("rgba(255, 0, 0, 0.3)"); // "red"
  });

});
