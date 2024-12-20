import React from "react";
import { svgMount } from "../../../../../__test_support__/svg_mount";
import {
  Zones0D, ZonesProps, Zones1D, Zones2D, getZoneType, ZoneType, spaceSelected,
} from "../zones";
import {
  fakePointGroup,
} from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import { DEFAULT_CRITERIA } from "../../../../../point_groups/criteria/interfaces";
import { Path } from "../../../../../internal_urls";

const fakeProps = (): ZonesProps => ({
  group: fakePointGroup(),
  botSize: {
    x: { value: 3000, isDefault: true },
    y: { value: 1500, isDefault: true },
    z: { value: 400, isDefault: true },
  },
  mapTransformProps: fakeMapTransformProps(),
  currentGroup: undefined,
});

describe("<Zones0D />", () => {
  it("renders none: no data", () => {
    const p = fakeProps();
    p.group.body.id = 1;
    p.group.body.criteria = DEFAULT_CRITERIA;
    const wrapper = svgMount(<Zones0D {...p} />);
    expect(wrapper.find("#zones-0D-1").length).toEqual(1);
    expect(wrapper.find("circle").length).toEqual(0);
  });

  it("renders none: some data", () => {
    const p = fakeProps();
    p.group.body.id = 1;
    p.group.body.criteria.number_eq = { x: [100] };
    const wrapper = svgMount(<Zones0D {...p} />);
    expect(wrapper.find("#zones-0D-1").length).toEqual(1);
    expect(wrapper.find("circle").length).toEqual(0);
  });

  it("renders one", () => {
    const p = fakeProps();
    p.group.body.id = 1;
    p.group.body.criteria.number_eq = { x: [100], y: [200] };
    const wrapper = svgMount(<Zones0D {...p} />);
    expect(wrapper.find("#zones-0D-1").length).toEqual(1);
    expect(wrapper.find("circle").length).toEqual(1);
  });

  it("renders some", () => {
    const p = fakeProps();
    p.group.body.id = 1;
    p.group.body.criteria.number_eq = { x: [100], y: [200, 300] };
    const wrapper = svgMount(<Zones0D {...p} />);
    expect(wrapper.find("#zones-0D-1").length).toEqual(1);
    expect(wrapper.find("circle").length).toEqual(2);
  });

  it("opens group", () => {
    const p = fakeProps();
    p.group.body.id = 1;
    p.group.body.criteria.number_eq = { x: [100], y: [200, 300] };
    const wrapper = svgMount(<Zones0D {...p} />);
    wrapper.find("#zones-0D-1").simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(Path.groups(1));
  });
});

describe("<Zones1D />", () => {
  it("renders none: no data", () => {
    const p = fakeProps();
    p.group.body.id = 1;
    p.group.body.criteria = DEFAULT_CRITERIA;
    const wrapper = svgMount(<Zones1D {...p} />);
    expect(wrapper.find("#zones-1D-1").length).toEqual(1);
    expect(wrapper.find("line").length).toEqual(0);
  });

  it("renders none: too constrained", () => {
    const p = fakeProps();
    p.group.body.id = 1;
    p.group.body.criteria.number_eq = { x: [100], y: [100] };
    const wrapper = svgMount(<Zones1D {...p} />);
    expect(wrapper.find("#zones-1D-1").length).toEqual(1);
    expect(wrapper.find("line").length).toEqual(0);
  });

  it("renders one: x", () => {
    const p = fakeProps();
    p.group.body.id = 1;
    p.group.body.criteria.number_eq = { x: [100] };
    const wrapper = svgMount(<Zones1D {...p} />);
    expect(wrapper.find("#zones-1D-1").length).toEqual(1);
    expect(wrapper.find("line").length).toEqual(1);
  });

  it("renders one: y", () => {
    const p = fakeProps();
    p.group.body.id = 1;
    p.group.body.criteria.number_eq = { y: [100] };
    const wrapper = svgMount(<Zones1D {...p} />);
    expect(wrapper.find("#zones-1D-1").length).toEqual(1);
    expect(wrapper.find("line").length).toEqual(1);
  });

  it("renders some", () => {
    const p = fakeProps();
    p.group.body.id = 1;
    p.group.body.criteria.number_eq = { x: [], y: [200, 300] };
    const wrapper = svgMount(<Zones1D {...p} />);
    expect(wrapper.find("#zones-1D-1").length).toEqual(1);
    expect(wrapper.find("line").length).toEqual(2);
  });

  it("opens group", () => {
    const p = fakeProps();
    p.group.body.id = 1;
    p.group.body.criteria.number_eq = { x: [], y: [200, 300] };
    const wrapper = svgMount(<Zones1D {...p} />);
    wrapper.find("#zones-1D-1").simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(Path.groups(1));
  });
});

describe("<Zones2D />", () => {
  it("renders none", () => {
    const p = fakeProps();
    p.group.body.id = 1;
    p.group.body.criteria = DEFAULT_CRITERIA;
    const wrapper = svgMount(<Zones2D {...p} />);
    expect(wrapper.find("#zones-2D-1").length).toEqual(1);
    expect(wrapper.find("rect").length).toEqual(0);
  });

  it("renders one", () => {
    const p = fakeProps();
    p.group.body.id = 1;
    p.group.body.criteria.number_gt = { x: 100, y: 200 };
    p.group.body.criteria.number_lt = { x: 300, y: 400 };
    const wrapper = svgMount(<Zones2D {...p} />);
    expect(wrapper.find("#zones-2D-1").length).toEqual(1);
    expect(wrapper.find("rect").length).toEqual(1);
  });

  it("renders one: rotated", () => {
    const p = fakeProps();
    p.mapTransformProps.quadrant = 4;
    p.mapTransformProps.xySwap = true;
    p.group.body.id = 1;
    p.group.body.criteria.number_gt = { x: 100, y: 200 };
    p.group.body.criteria.number_lt = { x: 300, y: 400 };
    const wrapper = svgMount(<Zones2D {...p} />);
    expect(wrapper.find("#zones-2D-1").length).toEqual(1);
    expect(wrapper.find("rect").length).toEqual(1);
  });

  it("opens group", () => {
    const p = fakeProps();
    p.group.body.id = 1;
    p.group.body.criteria.number_gt = { x: 100, y: 200 };
    p.group.body.criteria.number_lt = { x: 300, y: 400 };
    const wrapper = svgMount(<Zones2D {...p} />);
    wrapper.find("#zones-2D-1").simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(Path.groups(1));
  });
});

describe("getZoneType()", () => {
  it("returns none", () => {
    const group = fakePointGroup();
    expect(getZoneType(group)).toEqual(ZoneType.none);
  });

  it("returns area", () => {
    const group = fakePointGroup();
    group.body.criteria.number_gt = { x: 100 };
    expect(getZoneType(group)).toEqual(ZoneType.area);
  });

  it("returns lines", () => {
    const group = fakePointGroup();
    group.body.criteria.number_eq = { x: [100] };
    expect(getZoneType(group)).toEqual(ZoneType.lines);
  });

  it("returns points", () => {
    const group = fakePointGroup();
    group.body.criteria.number_eq = { x: [100], y: [100] };
    expect(getZoneType(group)).toEqual(ZoneType.points);
  });
});

describe("spaceSelected()", () => {
  const botSize = {
    x: { value: 3000, isDefault: true },
    y: { value: 1500, isDefault: true },
    z: { value: 400, isDefault: true },
  };

  it("is selected: area", () => {
    const group = fakePointGroup();
    group.body.criteria.number_eq = {};
    group.body.criteria.number_lt = {};
    group.body.criteria.number_gt = {};
    expect(spaceSelected(group, botSize)).toBeTruthy();
  });

  it("isn't selected: area", () => {
    const group = fakePointGroup();
    group.body.criteria.number_eq = {};
    group.body.criteria.number_lt = { x: 100 };
    group.body.criteria.number_gt = { x: 200 };
    expect(spaceSelected(group, botSize)).toBeFalsy();
  });

  it("is selected: lines", () => {
    const group = fakePointGroup();
    group.body.criteria.number_eq = { x: [0] };
    group.body.criteria.number_lt = {};
    group.body.criteria.number_gt = {};
    expect(spaceSelected(group, botSize)).toBeTruthy();
  });

  it("isn't selected: lines", () => {
    const group = fakePointGroup();
    group.body.criteria.number_eq = { x: [0] };
    group.body.criteria.number_lt = {};
    group.body.criteria.number_gt = { x: 100 };
    expect(spaceSelected(group, botSize)).toBeFalsy();
  });

  it("is selected: points", () => {
    const group = fakePointGroup();
    group.body.criteria.number_eq = { x: [0], y: [0] };
    group.body.criteria.number_lt = {};
    group.body.criteria.number_gt = {};
    expect(spaceSelected(group, botSize)).toBeTruthy();
  });

  it("isn't selected: points", () => {
    const group = fakePointGroup();
    group.body.criteria.number_eq = { x: [0], y: [0] };
    group.body.criteria.number_lt = { x: 0 };
    group.body.criteria.number_gt = {};
    expect(spaceSelected(group, botSize)).toBeFalsy();
  });
});
