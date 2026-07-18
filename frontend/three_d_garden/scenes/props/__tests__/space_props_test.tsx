import React from "react";
import {
  Astronaut, astronautPropsEqual, AstronautProps,
} from "../astronaut";
import { Hab, habPropsEqual, HabProps } from "../hab";
import { Rover, roverPropsEqual, RoverProps } from "../rover";
import { createRenderer, unmountRenderer } from
  "../../../../__test_support__/test_renderer";
import { Group, MeshPhongMaterial } from "../../../components";
import { Sphere } from "@react-three/drei";

const expectMaterials = (
  element: React.ReactElement,
  count: number,
  customizedCount: number,
  color: string,
  hasTexture: boolean,
) => {
  const wrapper = createRenderer(element);
  const materials = wrapper.root.findAllByType(MeshPhongMaterial);
  const customizedMaterials = materials
    .filter(material => material.props.color === color);

  expect(materials).toHaveLength(count);
  expect(customizedMaterials).toHaveLength(customizedCount);
  customizedMaterials.map(material => hasTexture
    ? expect(material.props.map).toBeDefined()
    : expect(material.props.map).toBeNull());
  unmountRenderer(wrapper);
};

describe("space scene props", () => {
  const astronautProps = (): AstronautProps => ({
    size: [900, 600, 1900],
    texture: "wood",
    color: "#123456",
  });
  const roverProps = (): RoverProps => ({
    size: [2800, 1800, 1500],
    texture: "wood",
    color: "#123456",
  });
  const habProps = (): HabProps => ({
    size: [6000, 4000, 3000],
    texture: "wood",
    color: "#123456",
  });

  it("applies astronaut materials to the customizable parts", () => {
    const p = astronautProps();
    expectMaterials(<Astronaut {...p} />, 11, 8, p.color, true);
    expectMaterials(<Astronaut {...p} texture={"none"} />,
      11, 8, p.color, false);
  });

  it("covers the front half of the astronaut helmet", () => {
    const wrapper = createRenderer(<Astronaut {...astronautProps()} />);
    const visor = wrapper.root.findAll(node =>
      node.type == Sphere && node.props.name == "astronaut-visor")[0];

    expect(visor.props.args)
      .toEqual([305, 16, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]);
    expect(visor.props.position).toEqual([0, 0, 0]);
    unmountRenderer(wrapper);
  });

  it("applies rover materials to the customizable parts", () => {
    const p = roverProps();
    expectMaterials(<Rover {...p} />, 12, 2, p.color, true);
    expectMaterials(<Rover {...p} texture={"none"} />,
      12, 2, p.color, false);
  });

  it("places the rover wheels on the ground", () => {
    const wrapper = createRenderer(<Rover {...roverProps()} />);
    const wheelMounts = wrapper.root.findAll(node =>
      node.type == Group && node.props.name == "rover-wheel-mount");

    expect(wheelMounts).toHaveLength(6);
    wheelMounts.map(wheel => expect(wheel.props.position[2]).toEqual(330));
    unmountRenderer(wrapper);
  });

  it("applies HAB materials to the customizable parts", () => {
    const p = habProps();
    expectMaterials(<Hab {...p} />, 17, 1, p.color, true);
    expectMaterials(<Hab {...p} texture={"none"} />,
      17, 1, p.color, false);
  });

  it("compares astronaut material and size inputs", () => {
    const p = astronautProps();
    expect(astronautPropsEqual(p, { ...p })).toBeTruthy();
    expect(astronautPropsEqual(p,
      { ...p, color: "#654321" })).toBeFalsy();
    expect(astronautPropsEqual(p,
      { ...p, texture: "concrete" })).toBeFalsy();
    expect(astronautPropsEqual(p,
      { ...p, size: [901, 600, 1900] })).toBeFalsy();
  });

  it("compares rover material and size inputs", () => {
    const p = roverProps();
    expect(roverPropsEqual(p, { ...p })).toBeTruthy();
    expect(roverPropsEqual(p, { ...p, color: "#654321" })).toBeFalsy();
    expect(roverPropsEqual(p,
      { ...p, texture: "concrete" })).toBeFalsy();
    expect(roverPropsEqual(p,
      { ...p, size: [2801, 1800, 1500] })).toBeFalsy();
  });

  it("compares HAB material and size inputs", () => {
    const p = habProps();
    expect(habPropsEqual(p, { ...p })).toBeTruthy();
    expect(habPropsEqual(p, { ...p, color: "#654321" })).toBeFalsy();
    expect(habPropsEqual(p,
      { ...p, texture: "concrete" })).toBeFalsy();
    expect(habPropsEqual(p,
      { ...p, size: [6001, 4000, 3000] })).toBeFalsy();
  });
});
