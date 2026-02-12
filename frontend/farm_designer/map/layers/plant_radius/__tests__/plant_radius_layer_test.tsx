import React from "react";
import {
  PlantRadiusLayer, PlantRadiusLayerProps, PlantRadius, PlantRadiusProps,
} from "../plant_radius_layer";
import { render } from "@testing-library/react";
import { fakePlant } from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";

describe("<PlantRadiusLayer />", () => {
  const fakeProps = (): PlantRadiusLayerProps => ({
    plants: [fakePlant()],
    mapTransformProps: fakeMapTransformProps(),
    animate: false,
    visible: true,
    currentPlant: undefined,
    hoveredSpread: undefined,
  });

  it("shows plant radius", () => {
    const p = fakeProps();
    const { container } = render(<svg><PlantRadiusLayer {...p} /></svg>);
    expect(container.querySelectorAll("circle").length).toEqual(1);
  });

  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const { container } = render(<svg><PlantRadiusLayer {...p} /></svg>);
    expect(container.querySelectorAll("circle").length).toEqual(0);
  });
});

describe("<PlantRadius />", () => {
  const fakeProps = (): PlantRadiusProps => ({
    plant: fakePlant(),
    mapTransformProps: fakeMapTransformProps(),
    visible: true,
    animate: true,
    currentPlant: undefined,
    hoveredSpread: undefined,
  });

  const getCircle = (props: PlantRadiusProps) => {
    const { container } = render(<svg><PlantRadius {...props} /></svg>);
    const circle = container.querySelector("circle");
    if (!circle) { throw new Error("Missing circle"); }
    return circle;
  };

  it("renders plant radius", () => {
    const circle = getCircle(fakeProps());
    expect(Number(circle.getAttribute("r"))).toEqual(25);
    expect(circle.classList.contains("animate")).toBeTruthy();
    expect(circle.getAttribute("fill")).toEqual("url(#PlantRadiusGradient)");
  });

  it("renders hovered spread plant radius", () => {
    const p = fakeProps();
    p.hoveredSpread = 1000;
    p.currentPlant = p.plant;
    const circle = getCircle(p);
    expect(Number(circle.getAttribute("r"))).toEqual(500);
  });

  it("doesn't animate", () => {
    const p = fakeProps();
    p.animate = false;
    const circle = getCircle(p);
    expect(circle.classList.contains("animate")).toBeFalsy();
  });
});
