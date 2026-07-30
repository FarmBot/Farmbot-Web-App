import * as THREE from "three";
import {
  frontSideMaterial,
  mergeSolidGeometries,
  solidVertexColorMaterial,
} from "../geometry_batching";

describe("geometry batching", () => {
  it("merges transformed solids with vertex colors", () => {
    const first = new THREE.BoxGeometry(1, 1, 1);
    const second = new THREE.BufferGeometry();
    second.setAttribute("position", new THREE.BufferAttribute(
      new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
      3,
    ));

    const merged = mergeSolidGeometries([
      { geometry: first, color: "red" },
      {
        geometry: second,
        color: "blue",
        position: [10, 0, 0],
        scale: [2, 2, 2],
      },
    ]);

    expect(merged?.getAttribute("position").count).toEqual(39);
    expect(merged?.getAttribute("color").count).toEqual(39);
    const positions = merged?.getAttribute("position");
    expect(positions?.getX(36)).toEqual(10);
    expect(positions?.getX(37)).toEqual(12);
    const colors = merged?.getAttribute("color");
    expect(colors?.getZ(36)).toEqual(1);
    expect(first.getAttribute("color")).toBeUndefined();
  });

  it("doesn't produce a partial batch", () => {
    expect(mergeSolidGeometries([
      { geometry: new THREE.BoxGeometry(), color: "red" },
      { geometry: undefined, color: "blue" },
    ])).toBeUndefined();
    expect(mergeSolidGeometries([])).toBeUndefined();
  });

  it("caches front-side material variants", () => {
    const source = new THREE.MeshStandardMaterial({
      color: "red",
      side: THREE.DoubleSide,
    });

    const frontSide = frontSideMaterial(source);
    const vertexColors = solidVertexColorMaterial(source);

    expect(frontSide).not.toBe(source);
    expect(frontSide.side).toEqual(THREE.FrontSide);
    expect(frontSideMaterial(source)).toBe(frontSide);
    expect(source.side).toEqual(THREE.DoubleSide);
    expect(vertexColors.color.getHex()).toEqual(0xffffff);
    expect(vertexColors.vertexColors).toEqual(true);
    expect(vertexColors.side).toEqual(THREE.DoubleSide);
    expect(solidVertexColorMaterial(source)).toBe(vertexColors);
  });
});
