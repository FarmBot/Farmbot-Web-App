import React from "react";
import { GardenPlant } from "../garden_plant";
import { render, fireEvent } from "@testing-library/react";
import { GardenPlantProps } from "../../../interfaces";
import { fakePlant } from "../../../../../__test_support__/fake_state/resources";
import { Actions } from "../../../../../constants";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import { SpecialStatus } from "farmbot";

describe("<GardenPlant />", () => {
  const fakeProps = (): GardenPlantProps => ({
    mapTransformProps: fakeMapTransformProps(),
    plant: fakePlant(),
    current: false,
    selected: false,
    editing: false,
    dragging: false,
    dispatch: jest.fn(),
    zoomLvl: 1.8,
    activeDragXY: { x: undefined, y: undefined, z: undefined },
    uuid: "plantUuid",
    animate: false,
    hovered: false,
    hoveredSpread: undefined,
  });

  const renderPlant = (props: GardenPlantProps) =>
    render(<svg><GardenPlant {...props} /></svg>);

  const getImage = (container: HTMLElement) => {
    const image = container.querySelector("image");
    if (!image) { throw new Error("Missing plant image"); }
    return image;
  };

  it("renders plant", () => {
    const p = fakeProps();
    p.selected = true;
    p.animate = false;
    const { container } = renderPlant(p);
    const image = getImage(container);
    expect(container.querySelectorAll("image").length).toEqual(1);
    expect(Number(image.getAttribute("opacity"))).toEqual(1);
    expect(image.getAttribute("visibility")).toEqual("visible");
    expect(Number(image.getAttribute("opacity"))).toEqual(1.0);
    expect(image.getAttribute("filter") || "").toEqual("");
    expect(container.querySelectorAll("text").length).toEqual(0);
    expect(container.querySelectorAll("rect").length).toBeLessThanOrEqual(1);
    expect(container.querySelectorAll("use").length).toEqual(0);
    expect(container.querySelectorAll(".soil-cloud").length).toEqual(0);
    const indicator = container.querySelector(".plant-indicator");
    if (!indicator) { throw new Error("Missing plant indicator"); }
    expect(indicator.getAttribute("class")).not.toContain("animate");
  });

  it("renders plant animations", () => {
    const p = fakeProps();
    p.animate = true;
    p.selected = true;
    const { container } = renderPlant(p);
    const soilCloud = container.querySelector(".soil-cloud");
    if (!soilCloud) { throw new Error("Missing soil cloud"); }
    expect(container.querySelectorAll(".soil-cloud").length).toEqual(1);
    expect(Number(soilCloud.getAttribute("r"))).toEqual(20);
    expect(container.querySelectorAll(".animate").length)
      .toBeGreaterThanOrEqual(2);
    const indicator = container.querySelector(".plant-indicator");
    if (!indicator) { throw new Error("Missing plant indicator"); }
    expect(indicator.getAttribute("class")).toContain("animate");
  });

  it("renders hovered spread size", () => {
    const p = fakeProps();
    p.current = true;
    p.animate = true;
    p.hoveredSpread = 1000;
    p.selected = true;
    const { container } = renderPlant(p);
    const soilCloud = container.querySelector(".soil-cloud");
    if (!soilCloud) { throw new Error("Missing soil cloud"); }
    expect(container.querySelectorAll(".soil-cloud").length).toEqual(1);
    expect(Number(soilCloud.getAttribute("r"))).toEqual(100);
  });

  it("calls the onClick callback", () => {
    const p = fakeProps();
    const { container } = renderPlant(p);
    fireEvent.click(getImage(container));
    expect(p.dispatch).toHaveBeenCalledWith(expect.any(Function));
  });

  it("begins hover", () => {
    const p = fakeProps();
    const { container } = renderPlant(p);
    fireEvent.mouseEnter(getImage(container));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_PLANT_LIST_ITEM,
      payload: p.uuid
    });
  });

  it("ends hover", () => {
    const p = fakeProps();
    const { container } = renderPlant(p);
    fireEvent.mouseLeave(getImage(container));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_PLANT_LIST_ITEM,
      payload: undefined
    });
  });

  it("doesn't render the indicator circle", () => {
    const p = fakeProps();
    const { container } = renderPlant(p);
    expect(container.querySelectorAll(".plant-indicator").length).toEqual(0);
  });

  it("renders the indicator circle", () => {
    const p = fakeProps();
    p.selected = true;
    const { container } = renderPlant(p);
    expect(container.querySelectorAll(".plant-indicator").length).toEqual(1);
    expect(container.querySelectorAll("#selected-plant-indicator").length)
      .toEqual(1);
  });

  it("doesn't render indicator circle twice", () => {
    const p = fakeProps();
    p.selected = true;
    p.hovered = true;
    const { container } = renderPlant(p);
    expect(container.querySelectorAll(".plant-indicator").length).toEqual(0);
    expect(container.querySelectorAll("#selected-plant-indicator").length)
      .toEqual(0);
  });

  it("renders while dragging", () => {
    const p = fakeProps();
    p.dragging = true;
    const { container } = renderPlant(p);
    const image = getImage(container);
    expect(image.getAttribute("visibility")).toEqual("hidden");
    expect(Number(image.getAttribute("opacity"))).toEqual(0.4);
  });

  it("renders grayscale", () => {
    const p = fakeProps();
    const plant = fakePlant();
    plant.specialStatus = SpecialStatus.DIRTY;
    plant.body.meta = { gridId: "fake grid uuid" };
    p.plant = plant;
    const { container } = renderPlant(p);
    expect(getImage(container).getAttribute("filter")).toEqual("url(#grayscale)");
  });
});
