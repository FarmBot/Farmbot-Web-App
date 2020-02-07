import * as React from "react";
import {
  SpreadLayer, SpreadLayerProps, SpreadCircle, SpreadCircleProps
} from "../spread_layer";
import { shallow } from "enzyme";
import { fakePlant } from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps
} from "../../../../../__test_support__/map_transform_props";
import { SpreadOverlapHelper } from "../spread_overlap_helper";

describe("<SpreadLayer/>", () => {
  const fakeProps = (): SpreadLayerProps => ({
    visible: true,
    plants: [fakePlant()],
    currentPlant: undefined,
    mapTransformProps: fakeMapTransformProps(),
    dragging: false,
    zoomLvl: 1.8,
    activeDragXY: { x: undefined, y: undefined, z: undefined },
    activeDragSpread: undefined,
    editing: false,
    animate: false,
  });

  it("shows spread", () => {
    const p = fakeProps();
    const wrapper = shallow(<SpreadLayer {...p} />);
    const layer = wrapper.find("#spread-layer");
    expect(layer.find("SpreadCircle").html()).toContain("r=\"125\"");
  });

  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const wrapper = shallow(<SpreadLayer {...p} />);
    const layer = wrapper.find("#spread-layer");
    expect(layer.find("SpreadCircle").length).toEqual(0);
  });

  it("is dragging", () => {
    const p = fakeProps();
    p.dragging = true;
    p.editing = true;
    p.currentPlant = p.plants[0];
    const wrapper = shallow(<SpreadLayer {...p} />);
    expect(wrapper.find(SpreadOverlapHelper).props().dragging).toEqual(true);
  });
});

describe("<SpreadCircle />", () => {
  const fakeProps = (): SpreadCircleProps => ({
    plant: fakePlant(),
    mapTransformProps: fakeMapTransformProps(),
    visible: true,
    animate: true,
  });

  it("uses spread value", () => {
    const wrapper = shallow(<SpreadCircle {...fakeProps()} />);
    wrapper.setState({ spread: 20 });
    expect(wrapper.find("circle").props().r).toEqual(100);
    expect(wrapper.find("circle").hasClass("animate")).toBeTruthy();
    expect(wrapper.find("circle").props().fill).toEqual("url(#SpreadGradient)");
  });
});
