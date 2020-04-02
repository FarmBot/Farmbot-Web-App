import * as React from "react";
import { svgMount } from "../../../../../__test_support__/svg_mount";
import { ZonesLayer, ZonesLayerProps } from "../zones_layer";
import {
  fakePointGroup,
} from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";

describe("<ZonesLayer />", () => {
  const fakeProps = (): ZonesLayerProps => ({
    visible: true,
    groups: [fakePointGroup(), fakePointGroup()],
    currentGroup: undefined,
    botSize: {
      x: { value: 3000, isDefault: true },
      y: { value: 1500, isDefault: true }
    },
    mapTransformProps: fakeMapTransformProps(),
    startDrag: jest.fn(),
  });

  it("renders", () => {
    const wrapper = svgMount(<ZonesLayer {...fakeProps()} />);
    expect(wrapper.find(".zones-layer").length).toEqual(1);
  });

  it("renders current group's zones: 2D", () => {
    const p = fakeProps();
    p.visible = false;
    p.groups[0].body.id = 1;
    p.groups[0].body.criteria.number_gt = { x: 100 };
    p.currentGroup = p.groups[0].uuid;
    p.groups[1].body.id = 2;
    p.groups[1].body.criteria.number_gt = { x: 200 };
    const wrapper = svgMount(<ZonesLayer {...p} />);
    expect(wrapper.find("#zones-0D-1").length).toEqual(0);
    expect(wrapper.find("#zones-1D-1").length).toEqual(0);
    expect(wrapper.find("#zones-2D-1").length).toEqual(1);
    expect(wrapper.find("#zones-2D-2").length).toEqual(0);
  });

  it("renders current group's zones: 1D", () => {
    const p = fakeProps();
    p.visible = false;
    p.groups[0].body.id = 1;
    p.groups[0].body.criteria.number_eq = { x: [100] };
    p.currentGroup = p.groups[0].uuid;
    const wrapper = svgMount(<ZonesLayer {...p} />);
    expect(wrapper.find("#zones-0D-1").length).toEqual(0);
    expect(wrapper.find("#zones-1D-1").length).toEqual(1);
    expect(wrapper.find("#zones-2D-1").length).toEqual(0);
  });

  it("renders current group's zones: 0D", () => {
    const p = fakeProps();
    p.visible = false;
    p.groups[0].body.id = 1;
    p.groups[0].body.criteria.number_eq = { x: [100], y: [100] };
    p.currentGroup = p.groups[0].uuid;
    const wrapper = svgMount(<ZonesLayer {...p} />);
    expect(wrapper.find("#zones-0D-1").length).toEqual(1);
    expect(wrapper.find("#zones-1D-1").length).toEqual(0);
    expect(wrapper.find("#zones-2D-1").length).toEqual(0);
  });

  it("renders current group's zones: none", () => {
    const p = fakeProps();
    p.visible = false;
    p.groups[0].body.id = 1;
    p.currentGroup = p.groups[0].uuid;
    const wrapper = svgMount(<ZonesLayer {...p} />);
    expect(wrapper.html()).toEqual(
      "<svg><g class=\"zones-layer\" style=\"cursor: pointer;\"></g></svg>");
  });

  it("doesn't render current group's zones", () => {
    const p = fakeProps();
    p.visible = false;
    const wrapper = svgMount(<ZonesLayer {...p} />);
    expect(wrapper.html()).toEqual(
      "<svg><g class=\"zones-layer\" style=\"cursor: pointer;\"></g></svg>");
  });
});
