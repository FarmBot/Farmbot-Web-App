import React from "react";
import { render } from "@testing-library/react";
import { HoveredPlant, HoveredPlantProps } from "../hovered_plant";
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
    const { container } = render(<svg><HoveredPlant {...p} /></svg>);
    const icon = container.querySelector("image");
    expect(icon?.getAttribute("visibility")).toEqual("visible");
    expect(icon?.getAttribute("opacity")).toEqual("1");
    expect(icon?.getAttribute("x")).toEqual("76");
    expect(icon?.getAttribute("width")).toEqual("48");
    expect(icon?.getAttribute("style")).toContain("pointer-events: none");
    expect(container.querySelectorAll("#plant-indicator").length).toEqual(1);
    const circles = container.querySelectorAll("#plant-indicator circle");
    expect(circles.length).toEqual(1);
    expect(circles[0]?.getAttribute("class")).toContain("is-chosen-true");
  });

  it("shows hovered plant icon with hovered spread size", () => {
    const p = fakeProps();
    p.designer.hoveredPlant = { plantUUID: "plant" };
    p.designer.hoveredSpread = 1000;
    const { container } = render(<svg><HoveredPlant {...p} /></svg>);
    expect(container.querySelector("image")?.getAttribute("width"))
      .toEqual("240");
  });

  it("shows hovered plant icon while dragging", () => {
    const p = fakeProps();
    p.designer.hoveredPlant = { plantUUID: "plant" };
    p.isEditing = true;
    p.dragging = true;
    const { container } = render(<svg><HoveredPlant {...p} /></svg>);
    const icon = container.querySelector("image");
    expect(icon?.getAttribute("visibility")).toEqual("visible");
    expect(icon?.getAttribute("style") || "").not.toContain("pointer-events");
    expect(icon?.getAttribute("opacity")).toEqual("0.4");
  });

  it("shows animated hovered plant indicator", () => {
    const p = fakeProps();
    p.designer.hoveredPlant = { plantUUID: "plant" };
    p.animate = true;
    const { container } = render(<svg><HoveredPlant {...p} /></svg>);
    expect(container.querySelectorAll(".plant-indicator").length).toEqual(1);
  });

  it("shows selected plant indicators", () => {
    const p = fakeProps();
    p.designer.hoveredPlant = { plantUUID: "plant" };
    p.currentPlant = fakePlant();
    const { container } = render(<svg><HoveredPlant {...p} /></svg>);
    expect(container.querySelectorAll("#selected-plant-spread-indicator").length)
      .toEqual(1);
    expect(container.querySelectorAll("#plant-indicator").length).toEqual(1);
    const circles = container.querySelectorAll("#plant-indicator circle");
    expect(circles.length).toEqual(1);
    expect(circles[0]?.getAttribute("class")).toContain("is-chosen-true");
    const spread = container.querySelector("#selected-plant-spread-indicator circle");
    expect(spread?.getAttribute("cx")).toEqual("100");
    expect(spread?.getAttribute("cy")).toEqual("200");
    expect(spread?.getAttribute("r")).toEqual("150");
  });

  it("doesn't show hovered plant icon", () => {
    const p = fakeProps();
    const { container } = render(<svg><HoveredPlant {...p} /></svg>);
    expect(container.querySelectorAll("#hovered-plant").length).toEqual(1);
    expect(container.querySelector("#hovered-plant")?.children.length).toEqual(0);
  });
});
