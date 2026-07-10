import * as THREE from "three";
import {
  fallbackInstancedMeshes,
  mergedInstancedGeometry,
} from "../merged_instanced_geometry";

describe("mergedInstancedGeometry", () => {
  it("bakes instanced matrices into one geometry", () => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(
      new Float32Array([
        0, 0, 0,
        1, 0, 0,
        0, 1, 0,
      ]),
      3,
    ));
    const matrices = new Float32Array(32);
    new THREE.Matrix4().identity().toArray(matrices, 0);
    new THREE.Matrix4().makeTranslation(10, 0, 0).toArray(matrices, 16);
    const model = {
      nodes: {
        mesh0_mesh: {
          geometry,
          instanceMatrix: new THREE.InstancedBufferAttribute(matrices, 16),
        } as THREE.Mesh & { instanceMatrix: THREE.InstancedBufferAttribute },
        ignored: { geometry } as THREE.Mesh,
      },
    };

    const merged = mergedInstancedGeometry(model, /^mesh/);

    expect(merged?.getAttribute("position").count).toEqual(6);
    const positions = merged?.getAttribute("position").array;
    expect(Array.from(positions || []).slice(3, 6)).toEqual([1000, 0, 0]);
    expect(Array.from(positions || []).slice(9, 12)).toEqual([10000, 0, 0]);
    expect(Array.from(geometry.getAttribute("position").array))
      .toEqual([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    expect(Array.from(matrices).slice(28, 31)).toEqual([10, 0, 0]);
    expect(mergedInstancedGeometry(model, /^mesh/)).toBe(merged);
  });

  it("returns undefined without matching instanced nodes", () => {
    const model = {
      nodes: {
        other: { geometry: new THREE.BufferGeometry() } as THREE.Mesh,
      },
    };

    expect(mergedInstancedGeometry(model, /^mesh/)).toBeUndefined();
  });

  it("builds fallback instance meshes from matching nodes", () => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(
      new Float32Array([1, 2, 3]),
      3,
    ));
    const matrices = new Float32Array(32);
    new THREE.Matrix4().identity().toArray(matrices, 0);
    new THREE.Matrix4().makeTranslation(10, 20, 30).toArray(matrices, 16);
    const material = new THREE.MeshStandardMaterial();
    const instanceMatrix = new THREE.InstancedBufferAttribute(matrices, 16);
    const model = {
      nodes: {
        mesh0_mesh: {
          geometry,
          instanceMatrix,
        } as THREE.Mesh & { instanceMatrix: THREE.InstancedBufferAttribute },
        other: { geometry } as THREE.Mesh,
      },
    };

    const fallback = fallbackInstancedMeshes(model, /^mesh/, material);

    expect(fallback).toHaveLength(1);
    const [geometryArg, fallbackMaterial, count] = fallback[0].props.args;
    const scaledGeometry = geometryArg as THREE.BufferGeometry;
    const scaledInstanceMatrix = (
      fallback[0].props.instanceMatrix
    ) as THREE.InstancedBufferAttribute;
    expect(scaledGeometry).not.toBe(geometry);
    expect(Array.from(scaledGeometry.getAttribute("position").array))
      .toEqual([1000, 2000, 3000]);
    expect(fallbackMaterial).toBe(material);
    expect(count).toEqual(2);
    expect(scaledInstanceMatrix).not.toBe(instanceMatrix);
    expect(Array.from(scaledInstanceMatrix.array).slice(28, 31))
      .toEqual([10000, 20000, 30000]);
    expect(Array.from(geometry.getAttribute("position").array))
      .toEqual([1, 2, 3]);
    expect(Array.from(instanceMatrix.array).slice(28, 31))
      .toEqual([10, 20, 30]);
  });
});
