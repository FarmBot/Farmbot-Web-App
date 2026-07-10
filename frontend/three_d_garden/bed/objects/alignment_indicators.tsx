import React from "react";
import {
  BufferAttribute, Color as ThreeColor, DoubleSide, DynamicDrawUsage,
  InstancedBufferAttribute, InstancedBufferGeometry, ShaderMaterial,
} from "three";
import { TaggedGenericPointer, TaggedWeedPointer } from "farmbot";
import type {
  AxisNumberProperty,
} from "../../../farm_designer/map/interfaces";
import type { Config } from "../../config";
import { POINT_PIN_RADIUS } from "../../garden/point";
import { DEFAULT_WEED_RADIUS } from "../../garden/weed";
import { get3DPositionFunc, zZero } from "../../helpers";
import type { ThreeDGardenPlant } from "../../garden/plants";
import { Mesh } from "../../components";

export const ALIGNMENT_INDICATOR_COLOR = "#00ffff";
export const ALIGNMENT_INDICATOR_HEIGHT = 5;
export const ALIGNMENT_INDICATOR_LENGTH = 40;
export const ALIGNMENT_INDICATOR_WIDTH = 10;

type AlignmentConfig = Pick<Config,
  "bedLengthOuter" | "bedWidthOuter" | "bedXOffset" | "bedYOffset"
  | "columnLength" | "zGantryOffset" | "mirrorX" | "mirrorY">;

export interface AlignmentObject {
  gardenX: number;
  gardenY: number;
  worldX: number;
  worldY: number;
  worldZ: number;
  radius: number;
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
    radius: number,
  ) => {
    const position = get3DPosition({ x: gardenX, y: gardenY });
    addToIndex(index, {
      gardenX,
      gardenY,
      worldX: position.x,
      worldY: position.y,
      worldZ: zBase + props.getZ(gardenX, gardenY)
        + ALIGNMENT_INDICATOR_HEIGHT,
      radius,
    });
  };
  if (props.showPlants) {
    props.plants.forEach(plant =>
      addObject(plant.x, plant.y, plant.size / 2));
  }
  if (props.showWeeds) {
    props.weeds.forEach(weed => addObject(
      weed.body.x,
      weed.body.y,
      weed.body.radius == 0 ? DEFAULT_WEED_RADIUS : weed.body.radius,
    ));
  }
  if (props.showPoints) {
    props.points.forEach(point => addObject(
      point.body.x,
      point.body.y,
      Math.max(point.body.radius, POINT_PIN_RADIUS),
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
  const segmentSides = new Float32Array([
    -1, -1, -1, -1,
    1, 1, 1, 1,
  ]);
  const segmentEnds = new Float32Array([
    0, 0, 1, 1,
    0, 0, 1, 1,
  ]);
  const segmentAcross = new Float32Array([
    -0.5, 0.5, -0.5, 0.5,
    -0.5, 0.5, -0.5, 0.5,
  ]);
  const indices = new Uint16Array([
    0, 1, 2, 2, 1, 3,
    4, 5, 6, 6, 5, 7,
  ]);
  const centers = new InstancedBufferAttribute(
    new Float32Array(capacity * 3), 3);
  const radii = new InstancedBufferAttribute(
    new Float32Array(capacity), 1);
  const axes = new InstancedBufferAttribute(
    new Float32Array(capacity), 1);
  centers.setUsage(DynamicDrawUsage);
  radii.setUsage(DynamicDrawUsage);
  axes.setUsage(DynamicDrawUsage);
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute(
    "segmentSide", new BufferAttribute(segmentSides, 1));
  geometry.setAttribute(
    "segmentEnd", new BufferAttribute(segmentEnds, 1));
  geometry.setAttribute(
    "segmentAcross", new BufferAttribute(segmentAcross, 1));
  geometry.setAttribute("indicatorCenter", centers);
  geometry.setAttribute("indicatorRadius", radii);
  geometry.setAttribute("indicatorAxis", axes);
  geometry.instanceCount = 0;
  return geometry;
};

export const createIndicatorMaterial = () => new ShaderMaterial({
  uniforms: {
    uColor: { value: new ThreeColor(ALIGNMENT_INDICATOR_COLOR) },
    uLength: { value: ALIGNMENT_INDICATOR_LENGTH },
    uWidth: { value: ALIGNMENT_INDICATOR_WIDTH },
  },
  vertexShader: `
    attribute float segmentSide;
    attribute float segmentEnd;
    attribute float segmentAcross;
    attribute vec3 indicatorCenter;
    attribute float indicatorRadius;
    attribute float indicatorAxis;

    uniform float uLength;
    uniform float uWidth;

    void main() {
      vec2 along = mix(
        vec2(1.0, 0.0),
        vec2(0.0, 1.0),
        indicatorAxis
      );
      vec2 across = vec2(-along.y, along.x);
      float distanceFromCenter = segmentSide * (
        indicatorRadius + segmentEnd * uLength
      );
      vec2 indicatorPosition = indicatorCenter.xy
        + along * distanceFromCenter
        + across * segmentAcross * uWidth;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(
        indicatorPosition,
        indicatorCenter.z,
        1.0
      );
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;

    void main() {
      gl_FragColor = vec4(uColor, 1.0);
    }
  `,
  depthTest: true,
  depthWrite: false,
  side: DoubleSide,
});

const writeInstances = (
  objects: AlignmentObject[] | undefined,
  axis: number,
  startIndex: number,
  centers: Float32Array,
  radii: Float32Array,
  axes: Float32Array,
) => {
  if (!objects) { return startIndex; }
  let instanceIndex = startIndex;
  for (const object of objects) {
    const centerIndex = instanceIndex * 3;
    centers[centerIndex] = object.worldX;
    centers[centerIndex + 1] = object.worldY;
    centers[centerIndex + 2] = object.worldZ;
    radii[instanceIndex] = object.radius;
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
  const radii = geometry.getAttribute("indicatorRadius") as
    InstancedBufferAttribute;
  const axes = geometry.getAttribute("indicatorAxis") as
    InstancedBufferAttribute;
  const centerArray = centers.array as Float32Array;
  const radiusArray = radii.array as Float32Array;
  const axisArray = axes.array as Float32Array;
  let count = writeInstances(
    index.byY.get(position.y), 0, 0,
    centerArray, radiusArray, axisArray);
  count = writeInstances(
    index.byX.get(position.x), 1, count,
    centerArray, radiusArray, axisArray);
  geometry.instanceCount = count;
  if (count > 0) {
    centers.clearUpdateRanges();
    centers.addUpdateRange(0, count * centers.itemSize);
    radii.clearUpdateRanges();
    radii.addUpdateRange(0, count * radii.itemSize);
    axes.clearUpdateRanges();
    axes.addUpdateRange(0, count * axes.itemSize);
    centers.needsUpdate = true;
    radii.needsUpdate = true;
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
    raycast={noRaycast} />;
});

AlignmentIndicators.displayName = "AlignmentIndicators";
