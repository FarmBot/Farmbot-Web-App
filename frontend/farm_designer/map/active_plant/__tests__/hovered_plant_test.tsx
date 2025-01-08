import React from "react";
import { HoveredPlant, HoveredPlantProps } from "../hovered_plant";
import { shallow } from "enzyme";
import { fakePlant } from "../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps,
} from "../../../../__test_support__/map_transform_props";
import {
  fakeDesignerState,
} from "../../../../__test_support__/fake_designer_state";

describe("<HoveredPlant />", () => {
  const fakeProps = (): HoveredPlantProps => ({
    visible: true,
    spreadLayerVisible: false,
    dragging: false,
    currentPlant: undefined,
    designer: fakeDesignerState(),
    hoveredPlant: fakePlant(),
    isEditing: false,
    mapTransformProps: fakeMapTransformProps(),
    animate: false,
  });

  it("shows hovered plant icon", () => {
    const p = fakeProps();
    p.designer.hoveredPlant = { plantUUID: "plant" };
    const wrapper = shallow(<HoveredPlant {...p} />);
    const icon = wrapper.find("image").props();
    expect(icon.visibility).toBeTruthy();
    expect(icon.opacity).toEqual(1);
    expect(icon.x).toEqual(76);
    expect(icon.width).toEqual(48);
    expect(icon.style?.pointerEvents).toEqual("none");
    expect(wrapper.find("#plant-indicator").length).toEqual(1);
    expect(wrapper.find("Circle").length).toEqual(1);
    expect(wrapper.find("Circle").props().selected).toBeTruthy();
  });

  it("shows hovered plant icon with hovered spread size", () => {
    const p = fakeProps();
    p.designer.hoveredPlant = { plantUUID: "plant" };
    p.designer.hoveredSpread = 1000;
    const wrapper = shallow(<HoveredPlant {...p} />);
    const icon = wrapper.find("image").props();
    expect(icon.width).toEqual(240);
  });

  it("shows hovered plant icon while dragging", () => {
    const p = fakeProps();
    p.designer.hoveredPlant = { plantUUID: "plant" };
    p.isEditing = true;
    p.dragging = true;
    const wrapper = shallow(<HoveredPlant {...p} />);
    const icon = wrapper.find("image").props();
    expect(icon.visibility).toBeTruthy();
    expect(icon.style?.pointerEvents).toEqual(undefined);
    expect(icon.opacity).toEqual(0.4);
  });

  it("shows animated hovered plant indicator", () => {
    const p = fakeProps();
    p.designer.hoveredPlant = { plantUUID: "plant" };
    p.animate = true;
    const wrapper = shallow(<HoveredPlant {...p} />);
    expect(wrapper.find(".plant-indicator").length).toEqual(1);
  });

  it("shows selected plant indicators", () => {
    const p = fakeProps();
    p.designer.hoveredPlant = { plantUUID: "plant" };
    p.currentPlant = fakePlant();
    const wrapper = shallow(<HoveredPlant {...p} />);
    expect(wrapper.find("#selected-plant-spread-indicator").length).toEqual(1);
    expect(wrapper.find("#plant-indicator").length).toEqual(1);
    expect(wrapper.find("Circle").length).toEqual(1);
    expect(wrapper.find("Circle").props().selected).toBeTruthy();
    expect(wrapper.find("SpreadCircle").length).toEqual(1);
    expect(wrapper.find("SpreadCircle").html())
      .toContain("cx=\"100\" cy=\"200\" r=\"150\"");
  });

  it("doesn't show hovered plant icon", () => {
    const p = fakeProps();
    const wrapper = shallow(<HoveredPlant {...p} />);
    expect(wrapper.html()).toEqual("<g id=\"hovered-plant\"></g>");
  });
});
