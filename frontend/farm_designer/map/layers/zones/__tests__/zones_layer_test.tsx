import React from "react";
import { svgMount } from "../../../../../__test_support__/svg_mount";
import { ZonesLayer, ZonesLayerProps } from "../zones_layer";
import {
  fakePointGroup,
} from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import { HTMLAttributes, ReactWrapper } from "enzyme";

describe("<ZonesLayer />", () => {
  const fakeProps = (): ZonesLayerProps => ({
    visible: true,
    groups: [fakePointGroup(), fakePointGroup()],
    currentGroup: undefined,
    botSize: {
      x: { value: 3000, isDefault: true },
      y: { value: 1500, isDefault: true },
      z: { value: 400, isDefault: true },
    },
    mapTransformProps: fakeMapTransformProps(),
    startDrag: jest.fn(),
  });

  it("renders", () => {
    const wrapper = svgMount(<ZonesLayer {...fakeProps()} />);
    expect(wrapper.find(".zones-layer").length).toEqual(1);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expectSolid = (zone2D: ReactWrapper<HTMLAttributes, any>) => {
    const zoneProps = zone2D.find("rect").props();
    expect(zoneProps.fill).toEqual(undefined);
    expect(zoneProps.stroke).toEqual(undefined);
    expect(zoneProps.strokeDasharray).toEqual(undefined);
    expect(zoneProps.strokeWidth).toEqual(undefined);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expectOutline = (zone2D: ReactWrapper<HTMLAttributes, any>) => {
    const zoneProps = zone2D.find("rect").props();
    expect(zoneProps.fill).toEqual("none");
    expect(zoneProps.stroke).toEqual("white");
    expect(zoneProps.strokeDasharray).toEqual(15);
    expect(zoneProps.strokeWidth).toEqual(4);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expectNone = (zone2D: ReactWrapper<HTMLAttributes, any>) => {
    expect(zone2D.html()).toEqual(
      "<g id=\"zones-2D-1\" class=\"current\"></g>");
  };

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
    expectSolid(wrapper.find("#zones-2D-1"));
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
    expect(wrapper.find("#zones-2D-1").length).toEqual(1);
    expectNone(wrapper.find("#zones-2D-1"));
  });

  it("renders current group's zones: 0D", () => {
    const p = fakeProps();
    p.visible = false;
    p.groups[0].body.id = 1;
    p.groups[0].body.criteria.number_gt = { x: 10 };
    p.groups[0].body.criteria.number_eq = { x: [100], y: [100] };
    p.currentGroup = p.groups[0].uuid;
    const wrapper = svgMount(<ZonesLayer {...p} />);
    expect(wrapper.find("#zones-0D-1").length).toEqual(1);
    expect(wrapper.find("#zones-1D-1").length).toEqual(0);
    expect(wrapper.find("#zones-2D-1").length).toEqual(1);
    expectOutline(wrapper.find("#zones-2D-1"));
  });

  it("renders current group's zones: none", () => {
    const p = fakeProps();
    p.visible = false;
    p.groups[0].body.id = 1;
    p.currentGroup = p.groups[0].uuid;
    const wrapper = svgMount(<ZonesLayer {...p} />);
    expect(wrapper.html()).toEqual(
      `<svg>
        <g class="zones-layer" style="cursor: pointer;">
          <g id="zones-2D-1" class="current">
          </g>
        </g>
      </svg>`.replace(/[ ]{2,}/g, "").replace(/[^\S ]/g, ""));
  });

  it("doesn't render current group's zones", () => {
    const p = fakeProps();
    p.visible = false;
    const wrapper = svgMount(<ZonesLayer {...p} />);
    expect(wrapper.html()).toEqual(
      "<svg><g class=\"zones-layer\" style=\"cursor: pointer;\"></g></svg>");
  });
});
