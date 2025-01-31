import React from "react";
import {
  SpreadLayer, SpreadLayerProps, SpreadCircle, SpreadCircleProps,
} from "../spread_layer";
import { shallow } from "enzyme";
import { fakePlant } from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps,
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
    hoveredSpread: undefined,
  });

  it("shows spread", () => {
    const p = fakeProps();
    const wrapper = shallow(<SpreadLayer {...p} />);
    const layer = wrapper.find("#spread-layer");
    expect(layer.find("SpreadCircle").html()).toContain("r=\"150\"");
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
    hoveredSpread: undefined,
    selected: false,
  });

  it("uses spread value", () => {
    const wrapper = shallow(<SpreadCircle {...fakeProps()} />);
    expect(wrapper.find("circle").first().props().r).toEqual(150);
    expect(wrapper.find("circle").first().hasClass("animate")).toBeTruthy();
    expect(wrapper.find("circle").first().props().fill).toEqual("none");
  });

  it("shows hovered spread value", () => {
    const p = fakeProps();
    p.selected = true;
    p.hoveredSpread = 100;
    const wrapper = shallow(<SpreadCircle {...p} />);
    expect(wrapper.find("circle").last().props().r).toEqual(50);
  });

  it("fetches icon", () => {
    const p = fakeProps();
    p.plant.body.openfarm_slug = "slug";
    const np = fakeProps();
    np.plant.body.openfarm_slug = "new-slug";
    const wrapper = shallow(<SpreadCircle {...p} />);
    wrapper.setProps(np);
  });
});
