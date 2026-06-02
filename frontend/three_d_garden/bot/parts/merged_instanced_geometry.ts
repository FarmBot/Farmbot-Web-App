import * as THREE from "three";
import React from "react";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { InstancedMesh } from "../../components";

type InstancedNode = THREE.Mesh & {
  instanceMatrix?: THREE.InstancedBufferAttribute;
};

type InstancedModel = {
  nodes: Record<string, InstancedNode>;
};

const geometryCache = new WeakMap<InstancedModel, THREE.BufferGeometry>();

export const mergedInstancedGeometry = (
  model: InstancedModel,
  keyPattern: RegExp,
) => {
  const cached = geometryCache.get(model);
  if (cached) { return cached; }
  const matrix = new THREE.Matrix4();
  const geometries: THREE.BufferGeometry[] = [];
  Object.entries(model.nodes)
    .filter(([key, node]) => keyPattern.test(key) && node.instanceMatrix)
    .forEach(([, node]) => {
      const instanceMatrix = node.instanceMatrix;
      if (!instanceMatrix) { return; }
      for (let i = 0; i < instanceMatrix.count; i++) {
        matrix.fromArray(instanceMatrix.array, i * instanceMatrix.itemSize);
        const geometry = node.geometry.clone();
        geometry.applyMatrix4(matrix);
        geometries.push(geometry);
      }
    });
  if (geometries.length == 0) { return undefined; }
  const merged = mergeGeometries(geometries, false);
  geometries.forEach(geometry => geometry.dispose());
  if (!merged) { return undefined; }
  geometryCache.set(model, merged);
  return merged;
};

export const fallbackInstancedMeshes = (
  model: InstancedModel,
  keyPattern: RegExp,
  material: THREE.Material,
) =>
  Object.entries(model.nodes)
    .filter(([key]) => keyPattern.test(key))
    .map(([key, node]) =>
      React.createElement(InstancedMesh, {
        key,
        args: [
          node.geometry,
          material,
          node.instanceMatrix?.count || 1,
        ],
        instanceMatrix: node.instanceMatrix,
      }));
