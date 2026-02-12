import React from "react";
import { svgMount } from "../../../../__test_support__/svg_mount";
import {
  fakePlant, fakePlantTemplate, fakeWeed,
} from "../../../../__test_support__/fake_state/resources";
import { TaggedWeedPointer } from "farmbot";
import { TaggedPlant } from "../../interfaces";
import { ProfilePointProps } from "../interfaces";
import { PlantPoint, WeedPoint } from "../plants_and_weeds";
import { Color } from "../../../../ui";
import {
  fakeDesignerState,
} from "../../../../__test_support__/fake_designer_state";

describe("<PlantPoint />", () => {
  const fakeProps = (): ProfilePointProps<TaggedPlant> => ({
    point: fakePlant(),
    tools: [],
    getX: () => 0,
    profileAxis: "x",
    reversed: false,
    soilHeight: 0,
    getConfigValue: () => true,
    designer: fakeDesignerState(),
  });

  it("renders plant point", () => {
    const p = fakeProps();
    p.point.body.z = 0;
    p.soilHeight = 200;
    const { container } = svgMount(<PlantPoint {...p} />);
    expect(container.querySelector("#plant-profile-point")).toBeTruthy();
    expect(container.querySelector("#spread-profile")).toBeTruthy();
    expect(container.querySelector("#point-coordinate-indicator")?.getAttribute("cy"))
      .toEqual("200");
  });

  it("renders plant point at z", () => {
    const p = fakeProps();
    p.point.body.z = 100;
    p.soilHeight = 200;
    const { container } = svgMount(<PlantPoint {...p} />);
    expect(container.querySelector("#point-coordinate-indicator")?.getAttribute("cy"))
      .toEqual("100");
  });

  it("renders plant template", () => {
    const p = fakeProps();
    p.point = fakePlantTemplate();
    const { container } = svgMount(<PlantPoint {...p} />);
    expect(container.querySelector("#plant-profile-point")).toBeTruthy();
  });

  it("renders default spread", () => {
    const p = fakeProps();
    const plant = fakePlant();
    plant.body.openfarm_slug = "foo-bar";
    plant.body.radius = 25;
    p.point = plant;
    const { container } = svgMount(<PlantPoint {...p} />);
    expect(container.querySelector("#plant-profile-point")).toBeTruthy();
    expect(container.querySelector("#spread-profile")).toBeTruthy();
    expect(container.querySelector(".plant-radius")?.getAttribute("r")).toEqual("25");
  });

  it("renders hovered spread", () => {
    const p = fakeProps();
    const plant = fakePlant();
    plant.body.radius = 25;
    p.point = plant;
    p.designer.selectedPoints = [plant.uuid];
    p.designer.hoveredSpread = 1000;
    const { container } = svgMount(<PlantPoint {...p} />);
    expect(container.querySelector(".plant-radius")?.getAttribute("r")).toEqual("500");
  });
});

describe("<WeedPoint />", () => {
  const fakeProps = (): ProfilePointProps<TaggedWeedPointer> => ({
    point: fakeWeed(),
    tools: [],
    getX: () => 0,
    profileAxis: "x",
    reversed: false,
    soilHeight: 0,
    getConfigValue: () => true,
    designer: fakeDesignerState(),
  });

  it("renders weed point", () => {
    const p = fakeProps();
    p.point.body.meta.color = "yellow";
    const { container } = svgMount(<WeedPoint {...p} />);
    expect(container.querySelector("#weed-profile-point")).toBeTruthy();
    const circles = container.querySelectorAll("circle");
    expect(circles[circles.length - 1]?.getAttribute("fill")).toEqual("yellow");
  });

  it("uses default color", () => {
    const p = fakeProps();
    p.point.body.meta.color = undefined;
    const { container } = svgMount(<WeedPoint {...p} />);
    expect(container.querySelector("#weed-profile-point")).toBeTruthy();
    const circles = container.querySelectorAll("circle");
    expect(circles[circles.length - 1]?.getAttribute("fill")).toEqual(Color.red);
  });
});
