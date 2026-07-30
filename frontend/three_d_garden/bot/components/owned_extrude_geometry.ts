import React from "react";
import {
  BufferAttribute, BufferGeometry, ExtrudeGeometry,
  ExtrudeGeometryOptions, Shape,
} from "three";
import { perfCount } from "../../../performance/perf";

export type ExtrudeGeometryArgs = [Shape, ExtrudeGeometryOptions];

export const millimetreGeometryKey = (
  structuralKey: string,
  ...positions: number[]
) => [structuralKey, ...positions.map(position => Math.round(position))]
  .join(":");

export const updateBufferGeometry = (
  target: BufferGeometry,
  source: BufferGeometry,
) => {
  const targetAttributeNames = Object.keys(target.attributes);
  const sourceAttributeNames = Object.keys(source.attributes);
  if (targetAttributeNames.join(":") != sourceAttributeNames.join(":")) {
    throw new Error("Extrude geometry attribute topology changed.");
  }
  sourceAttributeNames.forEach(name => {
    const targetAttribute = target.getAttribute(name) as BufferAttribute;
    const sourceAttribute = source.getAttribute(name) as BufferAttribute;
    if (targetAttribute.itemSize != sourceAttribute.itemSize ||
      targetAttribute.count != sourceAttribute.count) {
      throw new Error(
        `${target.type} ${name} topology changed: ` +
        `${targetAttribute.count} to ${sourceAttribute.count}.`,
      );
    }
    targetAttribute.copyArray(sourceAttribute.array);
    targetAttribute.needsUpdate = true;
  });
  if (!!target.index != !!source.index ||
    target.index?.count != source.index?.count) {
    throw new Error("Extrude geometry index topology changed.");
  }
  if (target.index && source.index) {
    target.index.copyArray(source.index.array);
    target.index.needsUpdate = true;
  }
  target.computeBoundingBox();
  target.computeBoundingSphere();
};

export const updateExtrudeGeometry = updateBufferGeometry;

export const useOwnedBufferGeometries = <T extends BufferGeometry>(
  key: string,
  createGeometries: () => T[],
  metric: string,
) => {
  const geometries = React.useMemo(() => {
    perfCount(metric);
    return createGeometries().map(geometry => {
      geometry.name = key;
      return geometry;
    });
  }, [createGeometries, key, metric]);
  React.useLayoutEffect(() => () => {
    geometries.forEach(geometry => {
      perfCount(`${metric}.dispose`);
      geometry.dispose();
    });
  }, [geometries, metric]);
  return geometries;
};

export const useOwnedExtrudeGeometries = (
  key: string,
  createArgs: () => ExtrudeGeometryArgs[],
  metric: string,
) => {
  const createGeometries = React.useCallback(() =>
    createArgs().map(args => new ExtrudeGeometry(...args)), [createArgs]);
  return useOwnedBufferGeometries(key, createGeometries, metric);
};
