import React from "react";
import {
  BufferAttribute, Color as ThreeColor, DynamicDrawUsage,
  InstancedBufferAttribute, InstancedBufferGeometry, MeshPhongMaterial,
} from "three";
import { TaggedGenericPointer, TaggedWeedPointer } from "farmbot";
import type {
  AxisNumberProperty,
} from "../../../farm_designer/map/interfaces";
import type { Config } from "../../config";
import { RenderOrder } from "../../constants";
import { get3DPositionFunc, zZero } from "../../helpers";
import type { ThreeDGardenPlant } from "../../garden/plants";
import { Mesh } from "../../components";

export const ALIGNMENT_INDICATOR_COLOR = "#ffff00";
export const ALIGNMENT_INDICATOR_HEIGHT = 10;
export const ALIGNMENT_INDICATOR_LENGTH = 50;
export const ALIGNMENT_INDICATOR_RENDER_ORDER = RenderOrder.plants + 1;
export const ALIGNMENT_INDICATOR_WIDTH = 5;

type AlignmentConfig = Pick<Config,
  "bedLengthOuter" | "bedWidthOuter" | "bedXOffset" | "bedYOffset"
  | "columnLength" | "zGantryOffset" | "mirrorX" | "mirrorY">;

export interface AlignmentObject {
  gardenX: number;
  gardenY: number;
  worldX: number;
  worldY: number;
  worldZ: number;
}

export interface AlignmentIndex {
  byX: Map<number, AlignmentObject[]>;
  byY: Map<number, AlignmentObject[]>;
  objectCount: number;
}

export interface BuildAlignmentIndexProps {
  config: AlignmentConfig;
  plants: ThreeDGardenPlant[];
  weeds: TaggedWeedPointer[];
  points: TaggedGenericPointer[];
  showPlants: boolean;
  showWeeds: boolean;
  showPoints: boolean;
  getZ(x: number, y: number): number;
}

const addToIndex = (
  index: AlignmentIndex,
  object: AlignmentObject,
) => {
  const xObjects = index.byX.get(object.gardenX);
  xObjects
    ? xObjects.push(object)
    : index.byX.set(object.gardenX, [object]);
  const yObjects = index.byY.get(object.gardenY);
  yObjects
    ? yObjects.push(object)
    : index.byY.set(object.gardenY, [object]);
  index.objectCount += 1;
};

export const buildAlignmentIndex = (props: BuildAlignmentIndexProps) => {
  const index: AlignmentIndex = {
    byX: new Map(),
    byY: new Map(),
    objectCount: 0,
  };
  const get3DPosition = get3DPositionFunc(props.config);
  const zBase = zZero(props.config);
  const addObject = (
    gardenX: number,
    gardenY: number,
  ) => {
    const position = get3DPosition({ x: gardenX, y: gardenY });
    addToIndex(index, {
      gardenX,
      gardenY,
      worldX: position.x,
      worldY: position.y,
      worldZ: zBase + props.getZ(gardenX, gardenY)
        + ALIGNMENT_INDICATOR_HEIGHT,
    });
  };
  if (props.showPlants) {
    props.plants.forEach(plant =>
      addObject(plant.x, plant.y));
  }
  if (props.showWeeds) {
    props.weeds.forEach(weed => addObject(
      weed.body.x,
      weed.body.y,
    ));
  }
  if (props.showPoints) {
    props.points.forEach(point => addObject(
      point.body.x,
      point.body.y,
    ));
  }
  return index;
};

export const makeIndicatorCapacity = (objectCount: number) => {
  const required = Math.max(1, objectCount * 2);
  let capacity = 1;
  while (capacity < required) { capacity *= 2; }
  return capacity;
};

export const createIndicatorGeometry = (capacity: number) => {
  const geometry = new InstancedBufferGeometry();
  const positions = new Float32Array(8 * 3);
  const normals = new Float32Array(8 * 3);
  for (let index = 2; index < normals.length; index += 3) {
    normals[index] = 1;
  }
  const segmentAlong = new Float32Array([
    -0.5, -0.5, 0.5, 0.5,
    -0.5, -0.5, 0.5, 0.5,
  ]);
  const segmentAcross = new Float32Array([
    -0.5, 0.5, -0.5, 0.5,
    -0.5, 0.5, -0.5, 0.5,
  ]);
  const segmentHeights = new Float32Array([
    0, 0, 0, 0, 1, 1, 1, 1,
  ]);
  const indices = new Uint16Array([
    0, 1, 2, 2, 1, 3,
    4, 6, 5, 6, 7, 5,
    0, 4, 1, 1, 4, 5,
    2, 3, 6, 6, 3, 7,
    0, 2, 4, 4, 2, 6,
    1, 5, 3, 3, 5, 7,
  ]);
  const centers = new InstancedBufferAttribute(
    new Float32Array(capacity * 3), 3);
  const axes = new InstancedBufferAttribute(
    new Float32Array(capacity), 1);
  centers.setUsage(DynamicDrawUsage);
  axes.setUsage(DynamicDrawUsage);
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new BufferAttribute(normals, 3));
  geometry.setAttribute(
    "segmentAlong", new BufferAttribute(segmentAlong, 1));
  geometry.setAttribute(
    "segmentAcross", new BufferAttribute(segmentAcross, 1));
  geometry.setAttribute(
    "segmentHeight", new BufferAttribute(segmentHeights, 1));
  geometry.setAttribute("indicatorCenter", centers);
  geometry.setAttribute("indicatorAxis", axes);
  geometry.instanceCount = 0;
  return geometry;
};

export const createIndicatorMaterial = () => {
  const material = new MeshPhongMaterial({
    color: new ThreeColor(ALIGNMENT_INDICATOR_COLOR),
    depthTest: true,
    depthWrite: true,
    flatShading: true,
    transparent: true,
  });
  material.onBeforeCompile = shader => {
    shader.uniforms.uHeight = { value: ALIGNMENT_INDICATOR_HEIGHT };
    shader.uniforms.uLength = { value: ALIGNMENT_INDICATOR_LENGTH };
    shader.uniforms.uWidth = { value: ALIGNMENT_INDICATOR_WIDTH };
    shader.vertexShader = shader.vertexShader.replace(
      "#include <common>",
      `#include <common>
    attribute float segmentAlong;
    attribute float segmentAcross;
    attribute float segmentHeight;
    attribute vec3 indicatorCenter;
    attribute float indicatorAxis;

    uniform float uHeight;
    uniform float uLength;
    uniform float uWidth;
      `,
    ).replace(
      "#include <begin_vertex>",
      `
      vec2 along = mix(
        vec2(1.0, 0.0),
        vec2(0.0, 1.0),
        indicatorAxis
      );
      vec2 across = vec2(-along.y, along.x);
      vec2 indicatorPosition = indicatorCenter.xy
        + along * segmentAlong * uLength
        + across * segmentAcross * uWidth;
      vec3 transformed = vec3(
        indicatorPosition,
        indicatorCenter.z + (segmentHeight - 1.0) * uHeight
      );
      `,
    );
  };
  return material;
};

const writeInstances = (
  objects: AlignmentObject[] | undefined,
  axis: number,
  startIndex: number,
  centers: Float32Array,
  axes: Float32Array,
) => {
  if (!objects) { return startIndex; }
  let instanceIndex = startIndex;
  for (const object of objects) {
    const centerIndex = instanceIndex * 3;
    centers[centerIndex] = object.worldX;
    centers[centerIndex + 1] = object.worldY;
    centers[centerIndex + 2] = object.worldZ;
    axes[instanceIndex] = axis;
    instanceIndex += 1;
  }
  return instanceIndex;
};

export const updateIndicatorGeometry = (
  geometry: InstancedBufferGeometry,
  index: AlignmentIndex,
  position: AxisNumberProperty,
) => {
  const centers = geometry.getAttribute("indicatorCenter") as
    InstancedBufferAttribute;
  const axes = geometry.getAttribute("indicatorAxis") as
    InstancedBufferAttribute;
  const centerArray = centers.array as Float32Array;
  const axisArray = axes.array as Float32Array;
  let count = writeInstances(
    index.byY.get(position.y), 0, 0,
    centerArray, axisArray);
  count = writeInstances(
    index.byX.get(position.x), 1, count,
    centerArray, axisArray);
  geometry.instanceCount = count;
  if (count > 0) {
    centers.clearUpdateRanges();
    centers.addUpdateRange(0, count * centers.itemSize);
    axes.clearUpdateRanges();
    axes.addUpdateRange(0, count * axes.itemSize);
    centers.needsUpdate = true;
    axes.needsUpdate = true;
  }
  return count;
};

export interface AlignmentIndicatorController {
  update(position: AxisNumberProperty): void;
}

export type AlignmentIndicatorRef =
  React.RefObject<AlignmentIndicatorController | null>;

export interface AlignmentIndicatorsProps extends BuildAlignmentIndexProps { }

const noRaycast = () => undefined;

export const AlignmentIndicators = React.forwardRef<
  AlignmentIndicatorController,
  AlignmentIndicatorsProps
>((props, ref) => {
  const indexConfig = React.useMemo<AlignmentConfig>(() => ({
    bedLengthOuter: props.config.bedLengthOuter,
    bedWidthOuter: props.config.bedWidthOuter,
    bedXOffset: props.config.bedXOffset,
    bedYOffset: props.config.bedYOffset,
    columnLength: props.config.columnLength,
    zGantryOffset: props.config.zGantryOffset,
    mirrorX: props.config.mirrorX,
    mirrorY: props.config.mirrorY,
  }), [
    props.config.bedLengthOuter,
    props.config.bedWidthOuter,
    props.config.bedXOffset,
    props.config.bedYOffset,
    props.config.columnLength,
    props.config.zGantryOffset,
    props.config.mirrorX,
    props.config.mirrorY,
  ]);
  const index = React.useMemo(() => buildAlignmentIndex({
    config: indexConfig,
    plants: props.plants,
    weeds: props.weeds,
    points: props.points,
    showPlants: props.showPlants,
    showWeeds: props.showWeeds,
    showPoints: props.showPoints,
    getZ: props.getZ,
  }), [
    indexConfig,
    props.getZ,
    props.plants,
    props.points,
    props.showPlants,
    props.showPoints,
    props.showWeeds,
    props.weeds,
  ]);
  const capacity = makeIndicatorCapacity(index.objectCount);
  const geometry = React.useMemo(
    () => createIndicatorGeometry(capacity), [capacity]);
  const material = React.useMemo(createIndicatorMaterial, []);
  const lastPosition = React.useRef<AxisNumberProperty | undefined>(undefined);
  const update = React.useCallback((position: AxisNumberProperty) => {
    lastPosition.current ||= { x: position.x, y: position.y };
    lastPosition.current.x = position.x;
    lastPosition.current.y = position.y;
    updateIndicatorGeometry(geometry, index, position);
  }, [geometry, index]);

  React.useImperativeHandle(ref, () => ({ update }), [update]);
  React.useLayoutEffect(() => {
    const position = lastPosition.current;
    if (position) { updateIndicatorGeometry(geometry, index, position); }
  }, [geometry, index]);
  React.useEffect(() => () => geometry.dispose(), [geometry]);
  React.useEffect(() => () => material.dispose(), [material]);

  return <Mesh
    name={"alignment-indicators"}
    geometry={geometry}
    material={material}
    frustumCulled={false}
    renderOrder={ALIGNMENT_INDICATOR_RENDER_ORDER}
    raycast={noRaycast} />;
});

AlignmentIndicators.displayName = "AlignmentIndicators";
