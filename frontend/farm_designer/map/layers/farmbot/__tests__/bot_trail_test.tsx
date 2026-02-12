import React from "react";
import { render } from "@testing-library/react";
import {
  BotTrail, BotTrailProps, VirtualTrail, resetVirtualTrail,
} from "../bot_trail";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";

describe("<BotTrail />", () => {
  const fakeProps = (): BotTrailProps => {
    sessionStorage.setItem(VirtualTrail.records, JSON.stringify([
      { coord: { x: 0, y: 0, z: 0 }, water: 0 },
      { coord: { x: 1, y: 10, z: 100 }, water: 10 },
      { coord: { x: 2, y: 20, z: 200 }, water: 0 },
      { coord: { x: 3, y: 30, z: 300 }, water: 0 },
      { coord: { x: 4, y: 40, z: 400 }, water: 20 }]));
    return {
      position: { x: 0, y: 0, z: 0 },
      missedSteps: undefined,
      displayMissedSteps: false,
      mapTransformProps: fakeMapTransformProps(),
      peripheralValues: [],
    };
  };

  const renderTrail = (props: BotTrailProps) =>
    render(<svg><BotTrail {...props} /></svg>);

  const getNumericAttribute = (element: Element, key: string) => {
    const value = element.getAttribute(key);
    if (value === null) { throw new Error(`Missing attribute ${key}`); }
    return Number(value);
  };

  const lineProps = (line: Element) => ({
    id: line.getAttribute("id"),
    stroke: line.getAttribute("stroke"),
    strokeOpacity: getNumericAttribute(line, "stroke-opacity"),
    strokeWidth: getNumericAttribute(line, "stroke-width"),
    x1: getNumericAttribute(line, "x1"),
    x2: getNumericAttribute(line, "x2"),
    y1: getNumericAttribute(line, "y1"),
    y2: getNumericAttribute(line, "y2"),
  });

  it("shows custom length trail", () => {
    sessionStorage.setItem(VirtualTrail.length, JSON.stringify(5));
    const p = fakeProps();
    p.mapTransformProps.quadrant = 2;
    const { container } = renderTrail(p);
    const lines = container.querySelectorAll(".virtual-bot-trail line");
    expect(lines.length).toEqual(4);
    expect(lineProps(lines[0])).toEqual({
      id: "trail-line-1",
      stroke: "red",
      strokeOpacity: 0.25,
      strokeWidth: 1.5,
      x1: 2, x2: 1, y1: 20, y2: 10
    });
    expect(lineProps(lines[lines.length - 1])).toEqual({
      id: "trail-line-4",
      stroke: "red",
      strokeOpacity: 1,
      strokeWidth: 3,
      x1: 0, x2: 4, y1: 0, y2: 40
    });
  });

  it("shows profile trail", () => {
    const p = fakeProps();
    p.getX = coordinate => coordinate.x || 0;
    p.profileAxis = "y";
    p.selectionWidth = 50;
    p.profilePosition = { x: 0, y: 0 };
    const { container } = renderTrail(p);
    const lines = container.querySelectorAll(".virtual-bot-trail line");
    expect(lines.length).toEqual(2);
    expect(lineProps(lines[0])).toEqual({
      id: "trail-line-1",
      stroke: "red",
      strokeOpacity: 0.5,
      strokeWidth: 2,
      x1: 1, x2: 0, y1: 100, y2: 0
    });
  });

  it("shows default length trail", () => {
    sessionStorage.removeItem(VirtualTrail.length);
    const { container } = renderTrail(fakeProps());
    const lines = container.querySelectorAll(".virtual-bot-trail line");
    expect(lines.length).toEqual(5);
    expect(container.querySelectorAll(".virtual-bot-trail text").length)
      .toEqual(0);
  });

  it("doesn't store duplicate last trail point", () => {
    sessionStorage.removeItem(VirtualTrail.length);
    const p = fakeProps();
    p.position = { x: 4, y: 40, z: 400 };
    const { container } = renderTrail(p);
    const lines = container.querySelectorAll(".virtual-bot-trail line");
    expect(lines.length).toEqual(4);
  });

  it("shows water", () => {
    const { container } = renderTrail(fakeProps());
    const circles = container.querySelectorAll(".virtual-bot-trail circle");
    expect(circles.length).toEqual(2);
  });

  it("updates water circle size", () => {
    const p = fakeProps();
    p.position = { x: 4, y: 40, z: 400 };
    p.peripheralValues = [{ label: "water", value: true }];
    const { container } = renderTrail(p);
    const circles = container.querySelectorAll(".virtual-bot-trail circle");
    const water = circles[circles.length - 1];
    expect(getNumericAttribute(water, "r")).toEqual(21);
  });

  it("shows missed step indicators", () => {
    const p = fakeProps();
    p.missedSteps = { x: 60, y: 70, z: 80 };
    p.displayMissedSteps = true;
    const { container } = renderTrail(p);
    expect(container.querySelectorAll(".virtual-bot-trail text").length)
      .toEqual(3);
  });
});

describe("resetVirtualTrail()", () => {
  it("clears data", () => {
    sessionStorage.setItem(VirtualTrail.records, "[1]");
    resetVirtualTrail();
    expect(sessionStorage.getItem(VirtualTrail.records)).toEqual("[]");
  });
});
