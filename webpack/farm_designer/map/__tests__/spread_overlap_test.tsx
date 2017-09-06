import * as React from "react";
import { SpreadOverlapHelper } from "../spread_overlap_helper";
import { shallow } from "enzyme";
import { SpreadOverlapHelperProps } from "../interfaces";
import { fakePlant } from "../../../__test_support__/fake_state/resources";

describe("<SpreadOverlapHelper/>", () => {
  function fakeProps(): SpreadOverlapHelperProps {
    return {
      quadrant: 2,
      plant: fakePlant(),
      dragging: false,
      zoomLvl: 1.8,
      activeDragXY: { x: undefined, y: undefined, z: undefined }
    };
  }

  it("renders no overlap indicator", () => {
    const p = fakeProps();
    p.dragging = false;
    p.plant.body.x = 100;
    p.plant.body.y = 100;
    p.activeDragXY = { x: 600, y: 1000, z: 0 };
    const wrapper = shallow(<SpreadOverlapHelper {...p } />);
    expect(wrapper.find(".overlap-circle").props().fill).toEqual("none");
  });

  it("renders yellow overlap indicator", () => {
    const p = fakeProps();
    p.dragging = false;
    p.plant.body.x = 100;
    p.plant.body.y = 100;
    p.activeDragXY = { x: 300, y: 100, z: 0 };
    const wrapper = shallow(<SpreadOverlapHelper {...p } />);
    expect(wrapper.find(".overlap-circle").props().fill).toEqual("yellow");
  });

  it("renders orange overlap indicator", () => {
    const p = fakeProps();
    p.dragging = false;
    p.plant.body.x = 200;
    p.plant.body.y = 200;
    p.activeDragXY = { x: 100, y: 200, z: 0 };
    const wrapper = shallow(<SpreadOverlapHelper {...p } />);
    expect(wrapper.find(".overlap-circle").props().fill).toEqual("orange");
  });

  it("renders red overlap indicator", () => {
    const p = fakeProps();
    p.dragging = false;
    p.plant.body.x = 100;
    p.plant.body.y = 100;
    p.activeDragXY = { x: 100, y: 100, z: 0 };
    const wrapper = shallow(<SpreadOverlapHelper {...p } />);
    expect(wrapper.find(".overlap-circle").props().fill).toEqual("red");
  });

});
