import * as React from "react";
import { DragHelpers } from "../drag_helpers";
import { shallow } from "enzyme";
import { DragHelpersProps } from "../../interfaces";
import { fakePlant } from "../../../../__test_support__/fake_state/resources";
import { Color } from "../../../../ui/index";
import {
  fakeMapTransformProps
} from "../../../../__test_support__/map_transform_props";

describe("<DragHelpers/>", () => {
  function fakeProps(): DragHelpersProps {
    return {
      mapTransformProps: fakeMapTransformProps(),
      plant: fakePlant(),
      dragging: false,
      zoomLvl: 1.8,
      activeDragXY: { x: undefined, y: undefined, z: undefined },
      plantAreaOffset: { x: 100, y: 100 }
    };
  }

  it("doesn't render drag helpers", () => {
    const wrapper = shallow(<DragHelpers {...fakeProps()} />);
    expect(wrapper.find("text").length).toEqual(0);
    expect(wrapper.find("rect").length).toBeLessThanOrEqual(1);
    expect(wrapper.find("use").length).toEqual(0);
  });

  it("renders drag helpers", () => {
    const p = fakeProps();
    p.dragging = true;
    const wrapper = shallow(<DragHelpers {...p} />);
    expect(wrapper.find("#coordinates-tooltip").length).toEqual(1);
    expect(wrapper.find("#long-crosshair").length).toEqual(1);
    expect(wrapper.find("#short-crosshair").length).toEqual(1);
    expect(wrapper.find("#alignment-indicator").find("use").length).toBe(0);
    expect(wrapper.find("#drag-helpers").props().fill).toEqual(Color.darkGray);
  });

  it("renders coordinates tooltip while dragging", () => {
    const p = fakeProps();
    p.dragging = true;
    p.plant.body.x = 104;
    p.plant.body.y = 199;
    const wrapper = shallow(<DragHelpers {...p} />);
    expect(wrapper.find("text").length).toEqual(1);
    expect(wrapper.find("text").text()).toEqual("100, 200");
    expect(wrapper.find("text").props().fontSize).toEqual("1.25rem");
    expect(wrapper.find("text").props().dy).toEqual(-20);
  });

  it("renders coordinates tooltip while dragging: scaled", () => {
    const p = fakeProps();
    p.dragging = true;
    p.zoomLvl = 0.9;
    const wrapper = shallow(<DragHelpers {...p} />);
    expect(wrapper.find("text").length).toEqual(1);
    expect(wrapper.find("text").text()).toEqual("100, 200");
    expect(wrapper.find("text").props().fontSize).toEqual("3rem");
    expect(wrapper.find("text").props().dy).toEqual(-48);
  });

  it("renders crosshair while dragging", () => {
    const p = fakeProps();
    p.dragging = true;
    p.plant.body.id = 5;
    const wrapper = shallow(<DragHelpers {...p} />);
    const crosshair = wrapper.find("#short-crosshair");
    expect(crosshair.length).toEqual(1);
    const segment = crosshair.find("#crosshair-segment-5");
    expect(segment.length).toEqual(1);
    expect(segment.find("rect").props())
      .toEqual({ "height": 2, "width": 8, "x": 90, "y": 199 });
    const segments = crosshair.find("use");
    expect(segments.at(0).props().xlinkHref).toEqual("#crosshair-segment-5");
    expect(segments.at(0).props().transform).toEqual("rotate(0, 100, 200)");
    expect(segments.at(1).props().transform).toEqual("rotate(90, 100, 200)");
    expect(segments.at(2).props().transform).toEqual("rotate(180, 100, 200)");
    expect(segments.at(3).props().transform).toEqual("rotate(270, 100, 200)");
  });

  it("renders crosshair while dragging: scaled", () => {
    const p = fakeProps();
    p.dragging = true;
    p.zoomLvl = 0.9;
    const wrapper = shallow(<DragHelpers {...p} />);
    const crosshair = wrapper.find("#short-crosshair");
    expect(crosshair.length).toEqual(1);
    expect(crosshair.find("rect").first().props())
      .toEqual({ "height": 4.8, "width": 19.2, "x": 76, "y": 197.6 });
    expect(crosshair.find("use").length).toEqual(4);
  });

  it("renders vertical alignment indicators", () => {
    const p = fakeProps();
    p.dragging = false;
    p.plant.body.id = 5;
    p.plant.body.x = 100;
    p.plant.body.y = 100;
    p.activeDragXY = { x: 100, y: 0, z: 0 };
    const wrapper = shallow(<DragHelpers {...p} />);
    const indicators = wrapper.find("#alignment-indicator");
    expect(indicators.length).toEqual(1);
    const segment = indicators.find("#alignment-indicator-segment-5");
    expect(segment.length).toEqual(1);
    expect(segment.find("rect").props())
      .toEqual({ "height": 2, "width": 8, "x": 65, "y": 99 });
    const segments = indicators.find("use");
    expect(segments.length).toEqual(2);
    expect(segments.at(0).props().xlinkHref)
      .toEqual("#alignment-indicator-segment-5");
    expect(segments.at(0).props().transform).toEqual("rotate(90, 100, 100)");
    expect(segments.at(1).props().transform).toEqual("rotate(270, 100, 100)");
    expect(indicators.props().fill).toEqual(Color.red);
  });

  it("renders vertical alignment indicators: rotated map", () => {
    const p = fakeProps();
    p.mapTransformProps.xySwap = true;
    p.dragging = false;
    p.plant.body.x = 100;
    p.plant.body.y = 100;
    p.activeDragXY = { x: 100, y: 0, z: 0 };
    const wrapper = shallow(<DragHelpers {...p} />);
    const indicator = wrapper.find("#alignment-indicator");
    const segments = indicator.find("use");
    expect(segments.length).toEqual(2);
    expect(segments.at(0).props().transform).toEqual("rotate(0, 100, 100)");
    expect(segments.at(1).props().transform).toEqual("rotate(180, 100, 100)");
    expect(indicator.props().fill).toEqual(Color.red);
  });

  it("renders horizontal alignment indicators", () => {
    const p = fakeProps();
    p.dragging = false;
    p.plant.body.x = 100;
    p.plant.body.y = 100;
    p.activeDragXY = { x: 0, y: 100, z: 0 };
    const wrapper = shallow(<DragHelpers {...p} />);
    const indicator = wrapper.find("#alignment-indicator");
    const segments = indicator.find("use");
    expect(segments.length).toEqual(2);
    expect(segments.at(0).props().transform).toEqual("rotate(0, 100, 100)");
    expect(segments.at(1).props().transform).toEqual("rotate(180, 100, 100)");
    expect(indicator.props().fill).toEqual(Color.red);
  });

  it("renders horizontal alignment indicators: rotated map", () => {
    const p = fakeProps();
    p.mapTransformProps.xySwap = true;
    p.dragging = false;
    p.plant.body.x = 100;
    p.plant.body.y = 100;
    p.activeDragXY = { x: 0, y: 100, z: 0 };
    const wrapper = shallow(<DragHelpers {...p} />);
    const indicator = wrapper.find("#alignment-indicator");
    const segments = indicator.find("use");
    expect(segments.length).toEqual(2);
    expect(segments.at(0).props().transform).toEqual("rotate(90, 100, 100)");
    expect(segments.at(1).props().transform).toEqual("rotate(270, 100, 100)");
    expect(indicator.props().fill).toEqual(Color.red);
  });

  it("renders horizontal and vertical alignment indicators in quadrant 4", () => {
    const p = fakeProps();
    p.mapTransformProps.quadrant = 4;
    p.dragging = false;
    p.plant.body.id = 6;
    p.plant.body.x = 100;
    p.plant.body.y = 100;
    p.activeDragXY = { x: 100, y: 100, z: 0 };
    const wrapper = shallow(<DragHelpers {...p} />);
    const indicator = wrapper.find("#alignment-indicator");
    const masterSegment = indicator.find("#alignment-indicator-segment-6");
    const segmentProps = masterSegment.find("rect").props();
    expect(segmentProps.x).toEqual(2865);
    expect(segmentProps.y).toEqual(1399);
    const segments = indicator.find("use");
    expect(segments.length).toEqual(4);
    expect(segments.at(0).props().transform).toEqual("rotate(0, 2900, 1400)");
    expect(segments.at(1).props().transform).toEqual("rotate(180, 2900, 1400)");
    expect(segments.at(2).props().transform).toEqual("rotate(90, 2900, 1400)");
    expect(segments.at(3).props().transform).toEqual("rotate(270, 2900, 1400)");
    expect(indicator.props().fill).toEqual(Color.red);
  });

});
