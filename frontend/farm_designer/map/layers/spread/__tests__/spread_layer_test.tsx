import React from "react";
import {
  SpreadLayer, SpreadLayerProps, SpreadCircle, SpreadCircleProps,
} from "../spread_layer";
import { render } from "@testing-library/react";
import { fakePlant } from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import { findCrop } from "../../../../../crops/find";
import { defaultSpreadCmDia } from "../../../util";

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

  const renderLayer = (props: SpreadLayerProps) =>
    render(<svg><SpreadLayer {...props} /></svg>);

  it("shows spread", () => {
    const p = fakeProps();
    const id = p.plants[0].body.id;
    const spreadDiaCm = findCrop(p.plants[0].body.openfarm_slug).spread
      || defaultSpreadCmDia(p.plants[0].body.radius);
    const { container } = renderLayer(p);
    expect(container.querySelector(`circle#spread-${id}`)?.getAttribute("r"))
      .toEqual((spreadDiaCm / 2 * 10).toString());
  });

  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const { container } = renderLayer(p);
    expect(container.querySelectorAll("circle[id^=\"spread-\"]").length)
      .toEqual(0);
  });

  it("is dragging", () => {
    const p = fakeProps();
    p.dragging = true;
    p.editing = true;
    p.currentPlant = p.plants[0];
    const { container } = renderLayer(p);
    expect(container.querySelector(".overlap-circle")).toBeNull();
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

  const renderCircle = (props: SpreadCircleProps) =>
    render(<svg><SpreadCircle {...props} /></svg>);

  it("uses spread value", () => {
    const p = fakeProps();
    const spreadDiaCm = findCrop(p.plant.body.openfarm_slug).spread
      || defaultSpreadCmDia(p.plant.body.radius);
    const { container } = renderCircle(p);
    const spread = container.querySelector("circle");
    if (!spread) { throw new Error("Missing spread circle"); }
    expect(spread.getAttribute("r")).toEqual((spreadDiaCm / 2 * 10).toString());
    expect(spread.getAttribute("class") || "").toContain("animate");
    expect(spread.getAttribute("fill")).toEqual("none");
  });

  it("shows hovered spread value", () => {
    const p = fakeProps();
    p.selected = true;
    p.hoveredSpread = 100;
    const { container } = renderCircle(p);
    const circles = container.querySelectorAll("circle");
    expect(circles.item(circles.length - 1).getAttribute("r")).toEqual("50");
  });

  it("fetches icon", () => {
    const p = fakeProps();
    p.plant.body.openfarm_slug = "slug";
    const np = fakeProps();
    np.plant.body.openfarm_slug = "new-slug";
    const { rerender } = renderCircle(p);
    rerender(<svg><SpreadCircle {...np} /></svg>);
  });
});
