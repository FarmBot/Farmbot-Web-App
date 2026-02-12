import React from "react";
import { render } from "@testing-library/react";
import { DragHelpers } from "../drag_helpers";
import { DragHelpersProps } from "../../interfaces";
import { fakePlant } from "../../../../__test_support__/fake_state/resources";
import { Color } from "../../../../ui";
import {
  fakeMapTransformProps,
} from "../../../../__test_support__/map_transform_props";

const getHref = (use: Element) =>
  use.getAttribute("xlink:href") || use.getAttribute("href");

const getRectProps = (rect: Element | null) => {
  if (!rect) { throw new Error("Expected rect"); }
  return {
    height: parseFloat(rect.getAttribute("height") || "0"),
    width: parseFloat(rect.getAttribute("width") || "0"),
    x: parseFloat(rect.getAttribute("x") || "0"),
    y: parseFloat(rect.getAttribute("y") || "0"),
  };
};

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
    const { container } = render(<svg><DragHelpers {...fakeProps()} /></svg>);
    expect(container.querySelectorAll("text").length).toEqual(0);
    expect(container.querySelectorAll("rect").length).toBeLessThanOrEqual(1);
    expect(container.querySelectorAll("use").length).toEqual(0);
  });

  it("renders drag helpers", () => {
    const p = fakeProps();
    p.dragging = true;
    const { container } = render(<svg><DragHelpers {...p} /></svg>);
    expect(container.querySelectorAll("#coordinates-tooltip").length).toEqual(1);
    expect(container.querySelectorAll("#long-crosshair").length).toEqual(1);
    expect(container.querySelectorAll("#short-crosshair").length).toEqual(1);
    expect(container.querySelectorAll("#alignment-indicator use").length).toBe(0);
    expect(container.querySelector("#drag-helpers")?.getAttribute("fill"))
      .toEqual(Color.darkGray);
  });

  it("renders coordinates tooltip while dragging", () => {
    const p = fakeProps();
    p.dragging = true;
    p.plant.body.x = 104;
    p.plant.body.y = 199;
    const { container } = render(<svg><DragHelpers {...p} /></svg>);
    const text = container.querySelector("text");
    expect(text).toBeTruthy();
    expect(text?.textContent).toEqual("100, 200");
    expect(text?.getAttribute("font-size")).toEqual("1.25rem");
    expect(text?.getAttribute("dy")).toEqual("-20");
  });

  it("renders coordinates tooltip while dragging: scaled", () => {
    const p = fakeProps();
    p.dragging = true;
    p.zoomLvl = 0.9;
    const { container } = render(<svg><DragHelpers {...p} /></svg>);
    const text = container.querySelector("text");
    expect(text).toBeTruthy();
    expect(text?.textContent).toEqual("100, 200");
    expect(text?.getAttribute("font-size")).toEqual("3rem");
    expect(text?.getAttribute("dy")).toEqual("-48");
  });

  it("renders crosshair while dragging", () => {
    const p = fakeProps();
    p.dragging = true;
    p.plant.body.id = 5;
    const { container } = render(<svg><DragHelpers {...p} /></svg>);
    expect(container.querySelectorAll("#short-crosshair").length).toEqual(1);
    expect(container.querySelectorAll("#crosshair-segment-5").length).toEqual(1);
    expect(getRectProps(container.querySelector("#crosshair-segment-5 rect")))
      .toEqual({ height: 2, width: 8, x: 90, y: 199 });
    const segments = container.querySelectorAll("#short-crosshair use");
    expect(segments.length).toEqual(4);
    expect(getHref(segments[0])).toEqual("#crosshair-segment-5");
    expect(segments[0]?.getAttribute("transform")).toEqual("rotate(0, 100, 200)");
    expect(segments[1]?.getAttribute("transform")).toEqual("rotate(90, 100, 200)");
    expect(segments[2]?.getAttribute("transform")).toEqual("rotate(180, 100, 200)");
    expect(segments[3]?.getAttribute("transform")).toEqual("rotate(270, 100, 200)");
  });

  it("renders crosshair while dragging: scaled", () => {
    const p = fakeProps();
    p.dragging = true;
    p.zoomLvl = 0.9;
    const { container } = render(<svg><DragHelpers {...p} /></svg>);
    expect(container.querySelectorAll("#short-crosshair").length).toEqual(1);
    expect(getRectProps(container.querySelector("#short-crosshair rect")))
      .toEqual({ height: 4.8, width: 19.2, x: 76, y: 197.6 });
    expect(container.querySelectorAll("#short-crosshair use").length).toEqual(4);
  });

  it("doesn't render alignment indicators", () => {
    const p = fakeProps();
    p.dragging = false;
    p.plant.body.id = 5;
    p.plant.body.x = 100;
    p.plant.body.y = 100;
    p.activeDragXY = { x: 0, y: 0, z: 0 };
    const { container } = render(<svg><DragHelpers {...p} /></svg>);
    expect(container.querySelectorAll("#alignment-indicator").length).toEqual(1);
    expect(container.querySelectorAll("#alignment-indicator-segment-5").length)
      .toEqual(1);
    expect(getRectProps(container.querySelector("#alignment-indicator-segment-5 rect")))
      .toEqual({ height: 2, width: 8, x: 65, y: 99 });
    expect(container.querySelectorAll("#alignment-indicator use").length).toEqual(0);
    expect(container.querySelector("#alignment-indicator")?.getAttribute("fill"))
      .toEqual(Color.red);
  });

  it("renders vertical alignment indicators", () => {
    const p = fakeProps();
    p.dragging = false;
    p.plant.body.id = 5;
    p.plant.body.x = 100;
    p.plant.body.y = 100;
    p.activeDragXY = { x: 100, y: 0, z: 0 };
    const { container } = render(<svg><DragHelpers {...p} /></svg>);
    expect(container.querySelectorAll("#alignment-indicator").length).toEqual(1);
    expect(container.querySelectorAll("#alignment-indicator-segment-5").length)
      .toEqual(1);
    expect(getRectProps(container.querySelector("#alignment-indicator-segment-5 rect")))
      .toEqual({ height: 2, width: 8, x: 65, y: 99 });
    const segments = container.querySelectorAll("#alignment-indicator use");
    expect(segments.length).toEqual(2);
    expect(getHref(segments[0]))
      .toEqual("#alignment-indicator-segment-5");
    expect(segments[0]?.getAttribute("transform")).toEqual("rotate(90, 100, 100)");
    expect(segments[1]?.getAttribute("transform")).toEqual("rotate(270, 100, 100)");
    expect(container.querySelector("#alignment-indicator")?.getAttribute("fill"))
      .toEqual(Color.red);
  });

  it("renders vertical alignment indicators: rotated map", () => {
    const p = fakeProps();
    p.mapTransformProps.xySwap = true;
    p.dragging = false;
    p.plant.body.x = 100;
    p.plant.body.y = 100;
    p.activeDragXY = { x: 100, y: 0, z: 0 };
    const { container } = render(<svg><DragHelpers {...p} /></svg>);
    const segments = container.querySelectorAll("#alignment-indicator use");
    expect(segments.length).toEqual(2);
    expect(segments[0]?.getAttribute("transform")).toEqual("rotate(0, 100, 100)");
    expect(segments[1]?.getAttribute("transform")).toEqual("rotate(180, 100, 100)");
    expect(container.querySelector("#alignment-indicator")?.getAttribute("fill"))
      .toEqual(Color.red);
  });

  it("renders horizontal alignment indicators", () => {
    const p = fakeProps();
    p.dragging = false;
    p.plant.body.x = 100;
    p.plant.body.y = 100;
    p.activeDragXY = { x: 0, y: 100, z: 0 };
    const { container } = render(<svg><DragHelpers {...p} /></svg>);
    const segments = container.querySelectorAll("#alignment-indicator use");
    expect(segments.length).toEqual(2);
    expect(segments[0]?.getAttribute("transform")).toEqual("rotate(0, 100, 100)");
    expect(segments[1]?.getAttribute("transform")).toEqual("rotate(180, 100, 100)");
    expect(container.querySelector("#alignment-indicator")?.getAttribute("fill"))
      .toEqual(Color.red);
  });

  it("renders horizontal alignment indicators: rotated map", () => {
    const p = fakeProps();
    p.mapTransformProps.xySwap = true;
    p.dragging = false;
    p.plant.body.x = 100;
    p.plant.body.y = 100;
    p.activeDragXY = { x: 0, y: 100, z: 0 };
    const { container } = render(<svg><DragHelpers {...p} /></svg>);
    const segments = container.querySelectorAll("#alignment-indicator use");
    expect(segments.length).toEqual(2);
    expect(segments[0]?.getAttribute("transform")).toEqual("rotate(90, 100, 100)");
    expect(segments[1]?.getAttribute("transform")).toEqual("rotate(270, 100, 100)");
    expect(container.querySelector("#alignment-indicator")?.getAttribute("fill"))
      .toEqual(Color.red);
  });

  it("renders horizontal and vertical alignment indicators in quadrant 4", () => {
    const p = fakeProps();
    p.mapTransformProps.quadrant = 4;
    p.dragging = false;
    p.plant.body.id = 6;
    p.plant.body.x = 100;
    p.plant.body.y = 100;
    p.activeDragXY = { x: 100, y: 100, z: 0 };
    const { container } = render(<svg><DragHelpers {...p} /></svg>);
    const segmentProps = getRectProps(
      container.querySelector("#alignment-indicator-segment-6 rect"));
    expect(segmentProps.x).toEqual(2865);
    expect(segmentProps.y).toEqual(1399);
    const segments = container.querySelectorAll("#alignment-indicator use");
    expect(segments.length).toEqual(4);
    expect(segments[0]?.getAttribute("transform"))
      .toEqual("rotate(0, 2900, 1400)");
    expect(segments[1]?.getAttribute("transform"))
      .toEqual("rotate(180, 2900, 1400)");
    expect(segments[2]?.getAttribute("transform"))
      .toEqual("rotate(90, 2900, 1400)");
    expect(segments[3]?.getAttribute("transform"))
      .toEqual("rotate(270, 2900, 1400)");
    expect(container.querySelector("#alignment-indicator")?.getAttribute("fill"))
      .toEqual(Color.red);
  });
});
