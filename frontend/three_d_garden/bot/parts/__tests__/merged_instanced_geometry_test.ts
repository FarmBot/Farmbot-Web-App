import * as THREE from "three";
import { mergedInstancedGeometry } from "../merged_instanced_geometry";

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
    expect(Array.from(positions || []).slice(9, 12)).toEqual([10, 0, 0]);
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
});
