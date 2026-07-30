import React from "react";
import {
  fenceBoardGeometry, fenceLayout, Fence, fencePropsEqual,
} from "../fence";
import { createRenderer, unmountRenderer } from
  "../../../../__test_support__/test_renderer";
import { Vector3 } from "three";
import { range } from "lodash";
import { Box } from "@react-three/drei";
import { Mesh, MeshPhongMaterial } from "../../../components";

describe("<Fence />", () => {
  it("repeats boards across the x axis", () => {
    const layout = fenceLayout([1000, 100, 1200]);

    expect(layout.boardPositions).toHaveLength(7);
    expect(layout.boardArgs[1]).toEqual(100);
    expect(layout.boardPositions.every(position => position[1] == 0))
      .toBeTruthy();
    expect(layout.railArgs).toEqual([1000, 50, 100]);
  });

  it("repeats boards across the y axis", () => {
    const layout = fenceLayout([80, 600, 900]);

    expect(layout.boardPositions).toHaveLength(4);
    expect(layout.boardArgs).toEqual([80, 130, 900]);
    expect(layout.boardPositions.every(position => position[0] == 0))
      .toBeTruthy();
    expect(layout.railArgs).toEqual([40, 600, 100]);
  });

  it("renders boards and support rails", () => {
    const wrapper = createRenderer(<Fence
      size={[600, 80, 900]}
      texture={"wood"}
      color={"#123456"} />);
    const boards = wrapper.root.findAll(node =>
      node.type == Mesh && node.props.name == "fence-board");
    const rails = wrapper.root.findAll(node =>
      node.type == Box && node.props.name == "fence-rail");
    const materials = wrapper.root.findAllByType(MeshPhongMaterial);

    expect(boards).toHaveLength(4);
    expect(rails).toHaveLength(2);
    expect(materials).toHaveLength(6);
    materials.map(material =>
      expect(material.props.color).toEqual("#123456"));
    unmountRenderer(wrapper);
  });

  it("renders the requested color without a texture", () => {
    const wrapper = createRenderer(<Fence
      size={[600, 80, 900]}
      texture={"none"}
      color={"#654321"} />);
    const materials = wrapper.root.findAllByType(MeshPhongMaterial);

    expect(materials).toHaveLength(6);
    materials.map(material =>
      expect(material.props.map).toBeUndefined());
    unmountRenderer(wrapper);
  });

  it("chamfers both board top corners", () => {
    const geometry = fenceBoardGeometry(100, 900, 80);
    const positions = geometry.getAttribute("position");
    const topXs = [];
    for (let index = 0; index < positions.count; index++) {
      if (positions.getZ(index) == 450) {
        topXs.push(Math.abs(positions.getX(index)));
      }
    }

    expect(Math.max(...topXs)).toEqual(25);
    geometry.dispose();
  });

  it("normalizes board texture coordinates", () => {
    const geometry = fenceBoardGeometry(100, 900, 80);
    const uvs = geometry.getAttribute("uv");
    const values = range(uvs.count).flatMap(index => [
      uvs.getX(index),
      uvs.getY(index),
    ]);

    expect(Math.min(...values)).toEqual(0);
    expect(Math.max(...values)).toEqual(1);
    geometry.dispose();
  });

  it("preserves board orientation along either thin axis", () => {
    const alongX = fenceBoardGeometry(130, 900, 80);
    const alongY = fenceBoardGeometry(130, 900, 80, true);
    alongX.computeBoundingBox();
    alongY.computeBoundingBox();

    const alongXSize = alongX.boundingBox?.getSize(new Vector3()).toArray()
      .map(value => Math.round(value));
    const alongYSize = alongY.boundingBox?.getSize(new Vector3()).toArray()
      .map(value => Math.round(value));

    expect(alongXSize)
      .toEqual([130, 80, 900]);
    expect(alongYSize)
      .toEqual([80, 130, 900]);
    alongX.dispose();
    alongY.dispose();
  });

  it("compares fence sizes", () => {
    const p = {
      size: [1000, 100, 1200] as [number, number, number],
      texture: "wood" as const,
      color: "#123456",
    };

    expect(fencePropsEqual(p, { ...p })).toBeTruthy();
    expect(fencePropsEqual(p, { ...p, size: [1001, 100, 1200] })).toBeFalsy();
    expect(fencePropsEqual(p, { ...p, texture: "concrete" })).toBeFalsy();
    expect(fencePropsEqual(p, { ...p, color: "#654321" })).toBeFalsy();
  });
});
