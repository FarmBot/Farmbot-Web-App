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
    const wrapper = svgMount(<PlantPoint {...p} />);
    expect(wrapper.find("#plant-profile-point").length).toEqual(1);
    expect(wrapper.find("#spread-profile").length).toEqual(1);
    expect(wrapper.find("#point-coordinate-indicator").props().cy).toEqual(200);
  });

  it("renders plant point at z", () => {
    const p = fakeProps();
    p.point.body.z = 100;
    p.soilHeight = 200;
    const wrapper = svgMount(<PlantPoint {...p} />);
    expect(wrapper.find("#point-coordinate-indicator").props().cy).toEqual(100);
  });

  it("renders plant template", () => {
    const p = fakeProps();
    p.point = fakePlantTemplate();
    const wrapper = svgMount(<PlantPoint {...p} />);
    expect(wrapper.find("#plant-profile-point").length).toEqual(1);
  });

  it("renders default spread", () => {
    const p = fakeProps();
    const plant = fakePlant();
    plant.body.openfarm_slug = "foo-bar";
    plant.body.radius = 25;
    p.point = plant;
    const wrapper = svgMount(<PlantPoint {...p} />);
    expect(wrapper.find("#plant-profile-point").length).toEqual(1);
    expect(wrapper.find("#spread-profile").length).toEqual(1);
    expect(wrapper.find(".plant-radius").props().r).toEqual(25);
  });

  it("renders hovered spread", () => {
    const p = fakeProps();
    const plant = fakePlant();
    plant.body.radius = 25;
    p.point = plant;
    p.designer.selectedPoints = [plant.uuid];
    p.designer.hoveredSpread = 1000;
    const wrapper = svgMount(<PlantPoint {...p} />);
    expect(wrapper.find(".plant-radius").props().r).toEqual(500);
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
    const wrapper = svgMount(<WeedPoint {...p} />);
    expect(wrapper.find("#weed-profile-point").length).toEqual(1);
    expect(wrapper.find("circle").last().props().fill).toEqual("yellow");
  });

  it("uses default color", () => {
    const p = fakeProps();
    p.point.body.meta.color = undefined;
    const wrapper = svgMount(<WeedPoint {...p} />);
    expect(wrapper.find("#weed-profile-point").length).toEqual(1);
    expect(wrapper.find("circle").last().props().fill).toEqual(Color.red);
  });
});
