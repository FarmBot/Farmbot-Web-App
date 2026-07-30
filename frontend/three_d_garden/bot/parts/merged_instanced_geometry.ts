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
const scaledGeometryCache =
  new WeakMap<THREE.BufferGeometry, THREE.BufferGeometry>();
const scaledInstanceMatrixCache = new WeakMap<
  THREE.InstancedBufferAttribute,
  THREE.InstancedBufferAttribute
>();

const geometryInMillimeters = (
  geometry: THREE.BufferGeometry | undefined,
) => {
  if (!geometry) { return undefined; }
  const cached = scaledGeometryCache.get(geometry);
  if (cached) { return cached; }
  const scaled = geometry.clone();
  scaled.scale(1000, 1000, 1000);
  scaledGeometryCache.set(geometry, scaled);
  return scaled;
};

const instanceMatrixInMillimeters = (
  instanceMatrix: THREE.InstancedBufferAttribute | undefined,
) => {
  if (!instanceMatrix) { return undefined; }
  const cached = scaledInstanceMatrixCache.get(instanceMatrix);
  if (cached) { return cached; }
  const scaled = instanceMatrix.clone() as THREE.InstancedBufferAttribute;
  for (let i = 0; i < scaled.count; i++) {
    const offset = i * scaled.itemSize;
    scaled.array[offset + 12] *= 1000;
    scaled.array[offset + 13] *= 1000;
    scaled.array[offset + 14] *= 1000;
  }
  scaled.needsUpdate = true;
  scaledInstanceMatrixCache.set(instanceMatrix, scaled);
  return scaled;
};

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
      if (!instanceMatrix || !node.geometry) { return; }
      for (let i = 0; i < instanceMatrix.count; i++) {
        matrix.fromArray(instanceMatrix.array, i * instanceMatrix.itemSize);
        const geometry = node.geometry.clone();
        geometry.applyMatrix4(matrix);
        geometry.scale(1000, 1000, 1000);
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
          geometryInMillimeters(node.geometry),
          material,
          node.instanceMatrix?.count || 1,
        ],
        instanceMatrix: instanceMatrixInMillimeters(node.instanceMatrix),
      }));
