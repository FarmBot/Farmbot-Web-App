import React from "react";
import { ZonesLayer, ZonesLayerProps } from "../zones_layer";
import * as mapUtil from "../../../util";
import {
  fakePointGroup,
} from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import { render } from "@testing-library/react";

describe("<ZonesLayer />", () => {
  let allowGroupAreaInteractionSpy: jest.SpyInstance;

  beforeEach(() => {
    allowGroupAreaInteractionSpy =
      jest.spyOn(mapUtil, "allowGroupAreaInteraction")
        .mockReturnValue(false);
  });

  afterEach(() => {
    allowGroupAreaInteractionSpy.mockRestore();
  });

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

  const renderLayer = (props: ZonesLayerProps) =>
    render(<svg><ZonesLayer {...props} /></svg>);

  it("renders", () => {
    const { container } = renderLayer(fakeProps());
    expect(container.querySelectorAll(".zones-layer").length).toEqual(1);
  });

  const expectSolid = (container: HTMLElement, selector: string) => {
    const zone = container.querySelector(`${selector} rect`);
    if (!zone) { throw new Error("Missing zone rect"); }
    expect((zone.getAttribute("fill") ?? undefined)).toBeUndefined();
    expect((zone.getAttribute("stroke") ?? undefined)).toBeUndefined();
    expect((zone.getAttribute("stroke-dasharray") ?? undefined))
      .toBeUndefined();
    expect((zone.getAttribute("stroke-width") ?? undefined)).toBeUndefined();
  };

  const expectOutline = (container: HTMLElement, selector: string) => {
    const zone = container.querySelector(`${selector} rect`);
    if (!zone) { throw new Error("Missing zone rect"); }
    expect(zone.getAttribute("fill")).toEqual("none");
    expect(zone.getAttribute("stroke")).toEqual("white");
    expect(zone.getAttribute("stroke-dasharray")).toEqual("15");
    expect(zone.getAttribute("stroke-width")).toEqual("4");
  };

  const expectNone = (container: HTMLElement, selector: string) => {
    const zone = container.querySelector(selector);
    if (!zone) { throw new Error("Missing zone group"); }
    expect(zone.innerHTML).toEqual("");
  };

  it("renders current group's zones: 2D", () => {
    const p = fakeProps();
    p.visible = false;
    p.groups[0].body.id = 1;
    p.groups[0].body.criteria.number_gt = { x: 100 };
    p.currentGroup = p.groups[0].uuid;
    p.groups[1].body.id = 2;
    p.groups[1].body.criteria.number_gt = { x: 200 };
    const { container } = renderLayer(p);
    expect(container.querySelector("#zones-0D-1")).toBeNull();
    expect(container.querySelector("#zones-1D-1")).toBeNull();
    expect(container.querySelector("#zones-2D-1")).toBeInTheDocument();
    expectSolid(container, "#zones-2D-1");
    expect(container.querySelector("#zones-2D-2")).toBeNull();
  });

  it("renders current group's zones: 1D", () => {
    const p = fakeProps();
    p.visible = false;
    p.groups[0].body.id = 1;
    p.groups[0].body.criteria.number_eq = { x: [100] };
    p.currentGroup = p.groups[0].uuid;
    const { container } = renderLayer(p);
    expect(container.querySelector("#zones-0D-1")).toBeNull();
    expect(container.querySelector("#zones-1D-1")).toBeInTheDocument();
    expect(container.querySelector("#zones-2D-1")).toBeInTheDocument();
    expectNone(container, "#zones-2D-1");
  });

  it("renders current group's zones: 0D", () => {
    const p = fakeProps();
    p.visible = false;
    p.groups[0].body.id = 1;
    p.groups[0].body.criteria.number_gt = { x: 10 };
    p.groups[0].body.criteria.number_eq = { x: [100], y: [100] };
    p.currentGroup = p.groups[0].uuid;
    const { container } = renderLayer(p);
    expect(container.querySelector("#zones-0D-1")).toBeInTheDocument();
    expect(container.querySelector("#zones-1D-1")).toBeNull();
    expect(container.querySelector("#zones-2D-1")).toBeInTheDocument();
    expectOutline(container, "#zones-2D-1");
  });

  it("renders current group's zones: none", () => {
    const p = fakeProps();
    p.visible = false;
    p.groups[0].body.id = 1;
    p.currentGroup = p.groups[0].uuid;
    const { container } = renderLayer(p);
    expect(container.querySelector(".zones-layer")).toBeInTheDocument();
    expect((container.querySelector(".zones-layer") as HTMLElement)
      .style.pointerEvents).toEqual("none");
    expect(container.querySelector("#zones-2D-1")).toBeInTheDocument();
    expectNone(container, "#zones-2D-1");
  });

  it("doesn't render current group's zones", () => {
    const p = fakeProps();
    p.visible = false;
    const { container } = renderLayer(p);
    expect(container.querySelector(".zones-layer")).toBeInTheDocument();
    expect(container.querySelectorAll("[id^=\"zones-\"]").length).toEqual(0);
  });
});
