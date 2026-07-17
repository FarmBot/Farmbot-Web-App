import React from "react";
import {
  BufferAttribute as ThreeBufferAttribute,
  BufferGeometry as ThreeBufferGeometry,
  Camera as ThreeCamera, DynamicDrawUsage, Frustum, Material, Matrix4,
  Vector3, WebGLProgramParametersWithUniforms,
} from "three";
import {
  LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, Points,
  PointsMaterial,
} from "../components";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { range } from "lodash";
import { BigDistance } from "../constants";
import {
  CropConstellationCatalog, readCropConstellationCatalog,
} from "./constellation_data";
import {
  getPlantIconTextureTransform, getPlantIconTextureUrl,
} from "./plant_icon_atlas";
import { polarToCartesian, toRad } from "./celestial_coordinates";
import { ErrorBoundary } from "../../error_boundary";

export interface StarData {
  positions: Float32Array;
  sizes: Float32Array;
}

const BACKGROUND_STAR_COUNT = 2305;
const BACKGROUND_STAR_MAX_PHI = 90;
const MIN_CONSTELLATION_PHI = 20;
const MAX_CONSTELLATION_PHI = 90;
const MIN_CONSTELLATION_ANGULAR_SIZE = 10;
const MAX_CONSTELLATION_ANGULAR_SIZE = 25;
const CAMERA_SIDE_CLIP_DEGREES = 90;
const CAMERA_SIDE_CLIP_ALIGNMENT =
  Math.cos(toRad(CAMERA_SIDE_CLIP_DEGREES / 2));
const CONSTELLATION_LINE_OPACITY = 0.6;
const CONSTELLATION_IMAGE_OPACITY = 0.8;
const CONSTELLATION_IMAGE_FADE_IN_SECONDS = 0.15;
const CONSTELLATION_IMAGE_FADE_SECONDS = 4;
const CONSTELLATION_IMAGE_GRID_DIVISIONS = 8;
const CONSTELLATION_START_INTERVAL_SECONDS = 0.75;
const CONSTELLATION_DRAW_SECONDS = 3;
const CONSTELLATION_HOLD_SECONDS = 3.5;
const CONSTELLATION_FADE_SECONDS = 2;
const CONSTELLATION_EVENT_SECONDS =
  CONSTELLATION_DRAW_SECONDS
  + CONSTELLATION_HOLD_SECONDS
  + CONSTELLATION_FADE_SECONDS;
const INACTIVE_CONSTELLATION_START_TIME = -1_000_000;
const constellationTimeUniform = { value: 0 };
interface CameraSideClipUniform { value: number; }
interface ConstellationDebugUniform { value: number; }
const defaultCameraSideClipUniform = { value: 1 };
const defaultConstellationDebugUniform = { value: 0 };
const cropIconUrl = (cropSlug: string) =>
  `/crops/icons/${cropSlug}.avif`;
const BACKGROUND_STAR_CATALOG: CropConstellationCatalog = {
  coordinateScale: 1,
  constellations: [],
  totalPointCount: 0,
};

type ConstellationPoint = readonly [number, number];

export interface ConstellationPlacement {
  heading: number;
  phi: number;
  angularSize: number;
}

const randomBetween = (
  minimum: number,
  maximum: number,
  random: () => number,
) => minimum + random() * (maximum - minimum);

export const createConstellationPlacements = (
  catalog: CropConstellationCatalog,
  random = Math.random,
): ConstellationPlacement[] =>
  catalog.constellations.map((_constellation, index) => ({
    heading: index * 360 / catalog.constellations.length,
    phi: randomBetween(MIN_CONSTELLATION_PHI, MAX_CONSTELLATION_PHI, random),
    angularSize: randomBetween(
      MIN_CONSTELLATION_ANGULAR_SIZE,
      MAX_CONSTELLATION_ANGULAR_SIZE,
      random,
    ),
  }));

const projectConstellationCoordinates = (
  pointX: number,
  pointY: number,
  heading: number,
  phi: number,
  radius: number,
  angularSize: number,
): [number, number, number] => {
  const thetaRadians = toRad(heading);
  const phiRadians = toRad(phi);
  const center = polarToCartesian(radius, heading, phi);
  const right = [-Math.sin(thetaRadians), Math.cos(thetaRadians), 0];
  const up = [
    -Math.cos(phiRadians) * Math.cos(thetaRadians),
    -Math.cos(phiRadians) * Math.sin(thetaRadians),
    Math.sin(phiRadians),
  ];
  const tangentScale = 2 * radius
    * Math.tan(toRad(angularSize / 2));
  const position = [0, 1, 2].map(axis =>
    center[axis]
    + right[axis] * pointX * tangentScale
    + up[axis] * pointY * tangentScale);
  const radiusScale = radius / Math.hypot(...position);
  return position.map(value => value * radiusScale) as
    [number, number, number];
};

export const projectConstellationPoint = (
  point: ConstellationPoint,
  heading: number,
  phi = (MIN_CONSTELLATION_PHI + MAX_CONSTELLATION_PHI) / 2,
  radius = BigDistance.sunVisual,
  angularSize = (
    MIN_CONSTELLATION_ANGULAR_SIZE
    + MAX_CONSTELLATION_ANGULAR_SIZE
  ) / 2,
): [number, number, number] => {
  return projectConstellationCoordinates(
    point[0], point[1], heading, phi, radius, angularSize,
  );
};

export const generateStars = (
  catalog: CropConstellationCatalog,
  placements: ConstellationPlacement[],
  random = Math.random,
): StarData => {
  const minSize = 0.5;
  const sizeRange = 1.5;
  const r = BigDistance.sunVisual;
  const starCount = BACKGROUND_STAR_COUNT + catalog.totalPointCount;
  const positions = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  for (let i = 0; i < BACKGROUND_STAR_COUNT; i++) {
    const theta = random() * 360;
    const phi = random() * BACKGROUND_STAR_MAX_PHI;
    const position = polarToCartesian(r, theta, phi);
    const offset = i * 3;
    positions[offset] = position[0];
    positions[offset + 1] = position[1];
    positions[offset + 2] = position[2];
    sizes[i] = minSize + random() * sizeRange;
  }
  let starIndex = BACKGROUND_STAR_COUNT;
  catalog.constellations.forEach((constellation, placementIndex) => {
    const placement = placements[placementIndex];
    for (let pointIndex = 0;
      pointIndex < constellation.pointCount; pointIndex++) {
      const index = starIndex + pointIndex;
      const pointOffset = pointIndex * 2;
      const position = projectConstellationCoordinates(
        constellation.points[pointOffset] * catalog.coordinateScale,
        constellation.points[pointOffset + 1] * catalog.coordinateScale,
        placement.heading,
        placement.phi,
        BigDistance.sunVisual,
        placement.angularSize,
      );
      const offset = index * 3;
      positions[offset] = position[0];
      positions[offset + 1] = position[1];
      positions[offset + 2] = position[2];
      sizes[index] = 1.5 + random();
    }
    starIndex += constellation.pointCount;
  });
  return { positions, sizes };
};

export interface ConstellationVertexRange {
  start: number;
  count: number;
}
export interface ConstellationRuntime {
  catalog: CropConstellationCatalog;
  placements: ConstellationPlacement[];
  centers: Vector3[];
  starData?: StarData;
  backgroundStarGeometry?: ThreeBufferGeometry;
  constellationStarGeometry?: ThreeBufferGeometry;
  lineGeometry?: ThreeBufferGeometry;
  imageGeometry?: ThreeBufferGeometry;
  lineVertexRanges: ConstellationVertexRange[];
  imageVertexRanges: ConstellationVertexRange[];
}

const constellationRuntimes =
  new WeakMap<CropConstellationCatalog, ConstellationRuntime>();

export const getConstellationRuntime = (catalog: CropConstellationCatalog) => {
  let runtime = constellationRuntimes.get(catalog);
  if (!runtime) {
    const placements = createConstellationPlacements(catalog);
    runtime = {
      catalog,
      placements,
      centers: placements.map(placement => new Vector3(...polarToCartesian(
        BigDistance.sunVisual,
        placement.heading,
        placement.phi,
      ))),
      lineVertexRanges: [],
      imageVertexRanges: [],
    };
    constellationRuntimes.set(catalog, runtime);
  }
  return runtime;
};

export const getStarData = (runtime: ConstellationRuntime) => {
  runtime.starData ||= generateStars(
    runtime.catalog,
    runtime.placements,
  );
  return runtime.starData;
};

const createStarGeometry = (
  positions: Float32Array,
  sizes: Float32Array,
) => {
  const geometry = new ThreeBufferGeometry();
  geometry.setAttribute(
    "position",
    new ThreeBufferAttribute(positions, 3),
  );
  geometry.setAttribute(
    "starSize",
    new ThreeBufferAttribute(sizes, 1),
  );
  return geometry;
};

export const getBackgroundStarGeometry = (runtime: ConstellationRuntime) => {
  if (runtime.backgroundStarGeometry) {
    return runtime.backgroundStarGeometry;
  }
  const { positions, sizes } = getStarData(runtime);
  runtime.backgroundStarGeometry = createStarGeometry(
    positions.subarray(0, BACKGROUND_STAR_COUNT * 3),
    sizes.subarray(0, BACKGROUND_STAR_COUNT),
  );
  return runtime.backgroundStarGeometry;
};

export const getConstellationStarGeometry = (
  runtime: ConstellationRuntime,
) => {
  if (runtime.constellationStarGeometry) {
    return runtime.constellationStarGeometry;
  }
  const { positions, sizes } = getStarData(runtime);
  runtime.constellationStarGeometry = createStarGeometry(
    positions.subarray(BACKGROUND_STAR_COUNT * 3),
    sizes.subarray(BACKGROUND_STAR_COUNT),
  );
  return runtime.constellationStarGeometry;
};

export const getConstellationLineGeometry = (
  runtime: ConstellationRuntime,
) => {
  if (runtime.lineGeometry) { return runtime.lineGeometry; }
  const positions: number[] = [];
  const lineStarts: number[] = [];
  const constellationStartTimes: number[] = [];
  const segmentStarts: number[] = [];
  const segmentEnds: number[] = [];
  runtime.lineVertexRanges = [];
  const { catalog, placements } = runtime;
  catalog.constellations.forEach((constellation, index) => {
    const start = positions.length / 3;
    const placement = placements[index];
    const segments = range(constellation.pointCount).map(pointIndex => {
      const startOffset = pointIndex * 2;
      const endOffset = (pointIndex + 1) % constellation.pointCount * 2;
      const startPosition = projectConstellationCoordinates(
        constellation.points[startOffset] * catalog.coordinateScale,
        constellation.points[startOffset + 1] * catalog.coordinateScale,
        placement.heading,
        placement.phi,
        BigDistance.sunVisual,
        placement.angularSize,
      );
      const endPosition = projectConstellationCoordinates(
        constellation.points[endOffset] * catalog.coordinateScale,
        constellation.points[endOffset + 1] * catalog.coordinateScale,
        placement.heading,
        placement.phi,
        BigDistance.sunVisual,
        placement.angularSize,
      );
      return {
        startPosition,
        endPosition,
        length: Math.hypot(
          endPosition[0] - startPosition[0],
          endPosition[1] - startPosition[1],
          endPosition[2] - startPosition[2],
        ),
      };
    });
    const totalLength = segments.reduce((total, segment) =>
      total + segment.length, 0);
    let traversedLength = 0;
    segments.forEach(({ startPosition, endPosition, length }) => {
      const segmentStart = traversedLength / totalLength;
      traversedLength += length;
      const segmentEnd = traversedLength / totalLength;
      positions.push(...startPosition, ...endPosition);
      lineStarts.push(...startPosition, ...startPosition);
      constellationStartTimes.push(
        INACTIVE_CONSTELLATION_START_TIME,
        INACTIVE_CONSTELLATION_START_TIME,
      );
      segmentStarts.push(segmentStart, segmentStart);
      segmentEnds.push(segmentEnd, segmentEnd);
    });
    runtime.lineVertexRanges.push({
      start,
      count: positions.length / 3 - start,
    });
  });
  const geometry = new ThreeBufferGeometry();
  geometry.setAttribute(
    "position",
    new ThreeBufferAttribute(new Float32Array(positions), 3),
  );
  geometry.setAttribute(
    "constellationLineStart",
    new ThreeBufferAttribute(new Float32Array(lineStarts), 3),
  );
  const startTimeAttribute = new ThreeBufferAttribute(
    new Float32Array(constellationStartTimes),
    1,
  );
  startTimeAttribute.setUsage(DynamicDrawUsage);
  geometry.setAttribute("constellationStartTime", startTimeAttribute);
  geometry.setAttribute(
    "constellationSegmentStart",
    new ThreeBufferAttribute(new Float32Array(segmentStarts), 1),
  );
  geometry.setAttribute(
    "constellationSegmentEnd",
    new ThreeBufferAttribute(new Float32Array(segmentEnds), 1),
  );
  runtime.lineGeometry = geometry;
  return geometry;
};

export const getConstellationImageGeometry = (
  runtime: ConstellationRuntime,
) => {
  if (runtime.imageGeometry) { return runtime.imageGeometry; }
  const positions: number[] = [];
  const uvs: number[] = [];
  const constellationStartTimes: number[] = [];
  runtime.imageVertexRanges = [];
  runtime.catalog.constellations.forEach((constellation, index) => {
    const start = positions.length / 3;
    const placement = runtime.placements[index];
    const transform = getPlantIconTextureTransform(
      cropIconUrl(constellation.cropSlug),
    );
    if (!transform) {
      throw new Error(
        `Missing atlas frame for ${constellation.cropSlug}.`,
      );
    }
    const [offsetU, offsetV] = transform.offset;
    const [repeatU, repeatV] = transform.repeat;
    const gridSize = CONSTELLATION_IMAGE_GRID_DIVISIONS + 1;
    const gridPositions: [number, number, number][] = [];
    for (let row = 0; row < gridSize; row++) {
      for (let column = 0; column < gridSize; column++) {
        gridPositions.push(projectConstellationCoordinates(
          column / CONSTELLATION_IMAGE_GRID_DIVISIONS - 0.5,
          row / CONSTELLATION_IMAGE_GRID_DIVISIONS - 0.5,
          placement.heading,
          placement.phi,
          BigDistance.sunVisual,
          placement.angularSize,
        ));
      }
    }
    const gridPosition = (row: number, column: number) =>
      gridPositions[row * gridSize + column];
    const gridUv = (row: number, column: number) => [
      offsetU + column / CONSTELLATION_IMAGE_GRID_DIVISIONS * repeatU,
      offsetV + row / CONSTELLATION_IMAGE_GRID_DIVISIONS * repeatV,
    ];
    for (let row = 0; row < CONSTELLATION_IMAGE_GRID_DIVISIONS; row++) {
      for (let column = 0;
        column < CONSTELLATION_IMAGE_GRID_DIVISIONS; column++) {
        const bottomLeft = gridPosition(row, column);
        const bottomRight = gridPosition(row, column + 1);
        const topLeft = gridPosition(row + 1, column);
        const topRight = gridPosition(row + 1, column + 1);
        const bottomLeftUv = gridUv(row, column);
        const bottomRightUv = gridUv(row, column + 1);
        const topLeftUv = gridUv(row + 1, column);
        const topRightUv = gridUv(row + 1, column + 1);
        positions.push(
          ...bottomLeft, ...topRight, ...bottomRight,
          ...bottomLeft, ...topLeft, ...topRight,
        );
        uvs.push(
          ...bottomLeftUv, ...topRightUv, ...bottomRightUv,
          ...bottomLeftUv, ...topLeftUv, ...topRightUv,
        );
      }
    }
    const count = positions.length / 3 - start;
    for (let vertex = 0; vertex < count; vertex++) {
      constellationStartTimes.push(
        INACTIVE_CONSTELLATION_START_TIME,
      );
    }
    runtime.imageVertexRanges.push({ start, count });
  });
  const geometry = new ThreeBufferGeometry();
  geometry.setAttribute(
    "position",
    new ThreeBufferAttribute(new Float32Array(positions), 3),
  );
  geometry.setAttribute(
    "uv",
    new ThreeBufferAttribute(new Float32Array(uvs), 2),
  );
  const startTimeAttribute = new ThreeBufferAttribute(
    new Float32Array(constellationStartTimes),
    1,
  );
  startTimeAttribute.setUsage(DynamicDrawUsage);
  geometry.setAttribute("constellationStartTime", startTimeAttribute);
  runtime.imageGeometry = geometry;
  return geometry;
};

export const updateConstellationStartTime = (
  geometry: ThreeBufferGeometry,
  range: ConstellationVertexRange | undefined,
  startTime: number,
) => {
  if (!range) { return; }
  const attribute = geometry.getAttribute(
    "constellationStartTime",
  ) as ThreeBufferAttribute;
  const startTimes = attribute.array as Float32Array;
  startTimes.fill(startTime, range.start, range.start + range.count);
  attribute.needsUpdate = true;
};

export const setConstellationStartTime = (
  runtime: ConstellationRuntime,
  index: number,
  startTime: number,
) => {
  updateConstellationStartTime(
    getConstellationLineGeometry(runtime),
    runtime.lineVertexRanges[index],
    startTime,
  );
  updateConstellationStartTime(
    getConstellationImageGeometry(runtime),
    runtime.imageVertexRanges[index],
    startTime,
  );
};

export const resetConstellationStartTimes = (
  runtime: ConstellationRuntime,
) => {
  [
    getConstellationLineGeometry(runtime),
    getConstellationImageGeometry(runtime),
  ].forEach(geometry => {
    const attribute = geometry.getAttribute(
      "constellationStartTime",
    ) as ThreeBufferAttribute;
    (attribute.array as Float32Array).fill(
      INACTIVE_CONSTELLATION_START_TIME,
    );
    attribute.needsUpdate = true;
  });
};

export const headingDistance = (first: number, second: number) => {
  const distance = Math.abs(first - second) % 360;
  return Math.min(distance, 360 - distance);
};

export interface ConstellationAnimationState {
  nextStartTime: number;
  startTimes: number[];
}

export const createConstellationAnimationState = (
  catalog: CropConstellationCatalog,
): ConstellationAnimationState => ({
  nextStartTime: 0,
  startTimes: catalog.constellations.map(() =>
    INACTIVE_CONSTELLATION_START_TIME),
});

export const resetConstellationAnimation = (
  runtime: ConstellationRuntime,
  state: ConstellationAnimationState,
) => {
  resetConstellationStartTimes(runtime);
  state.startTimes.fill(INACTIVE_CONSTELLATION_START_TIME);
  state.nextStartTime = 0;
};

export const isConstellationAnimationActive = (
  startTime: number,
  now: number,
): boolean => {
  const imageTime = now - startTime - CONSTELLATION_DRAW_SECONDS;
  return imageTime > 0
    && imageTime < CONSTELLATION_IMAGE_FADE_SECONDS;
};

export const isConstellationCameraSideClipped = (
  center: Vector3,
  cameraPosition: Vector3,
): boolean => {
  const magnitude = center.length() * cameraPosition.length();
  return magnitude > 0
    && center.dot(cameraPosition) / magnitude
    > CAMERA_SIDE_CLIP_ALIGNMENT;
};

export interface ConstellationDiscoveryState {
  projectionMatrix: Matrix4;
  frustum: Frustum;
  cameraPosition: Vector3;
  reportedIndices: Set<number>;
}

export const createConstellationDiscoveryState =
  (): ConstellationDiscoveryState => ({
    projectionMatrix: new Matrix4(),
    frustum: new Frustum(),
    cameraPosition: new Vector3(),
    reportedIndices: new Set<number>(),
  });

export interface DiscoverConstellationsInViewProps {
  runtime: ConstellationRuntime;
  animationState: ConstellationAnimationState;
  discoveryState: ConstellationDiscoveryState;
  camera: ThreeCamera;
  now: number;
  cameraSideClipEnabled: boolean;
  onConstellationFound(cropSlug: string): void;
}

export const discoverConstellationsInView = (
  props: DiscoverConstellationsInViewProps,
) => {
  const projectionMatrix = props.discoveryState.projectionMatrix
    .multiplyMatrices(
      props.camera.projectionMatrix,
      props.camera.matrixWorldInverse,
    );
  const frustum = props.discoveryState.frustum.setFromProjectionMatrix(
    projectionMatrix,
  );
  props.camera.getWorldPosition(props.discoveryState.cameraPosition);
  props.animationState.startTimes.forEach((startTime, index) => {
    if (props.discoveryState.reportedIndices.has(index)
      || !isConstellationAnimationActive(startTime, props.now)) {
      return;
    }
    const center = props.runtime.centers[index];
    const clipped = props.cameraSideClipEnabled
      && isConstellationCameraSideClipped(
        center,
        props.discoveryState.cameraPosition,
      );
    if (clipped || !frustum.containsPoint(center)) { return; }
    props.discoveryState.reportedIndices.add(index);
    props.onConstellationFound(
      props.runtime.catalog.constellations[index].cropSlug,
    );
  });
};

export const advanceConstellationAnimation = (
  runtime: ConstellationRuntime,
  state: ConstellationAnimationState,
  now: number,
  random = Math.random,
) => {
  constellationTimeUniform.value = now;
  if (now < state.nextStartTime) { return; }

  const activeIndices = state.startTimes
    .map((startTime, index) => ({ index, startTime }))
    .filter(({ startTime }) =>
      now - startTime < CONSTELLATION_EVENT_SECONDS);
  const eligibleIndices = runtime.catalog.constellations
    .map((_constellation, index) => index)
    .filter(index => activeIndices.every(active =>
      headingDistance(
        runtime.placements[index].heading,
        runtime.placements[active.index].heading,
      ) > Math.max(
        runtime.placements[index].angularSize,
        runtime.placements[active.index].angularSize,
      )));
  if (eligibleIndices.length > 0) {
    const randomIndex = Math.floor(random() * eligibleIndices.length);
    const selectedIndex = eligibleIndices[randomIndex];
    state.startTimes[selectedIndex] = now;
    setConstellationStartTime(runtime, selectedIndex, now);
  }
  state.nextStartTime = now + CONSTELLATION_START_INTERVAL_SECONDS;
};

export const cameraSideShaderModification = (
  shader: WebGLProgramParametersWithUniforms,
  cameraSideClipUniform: CameraSideClipUniform =
  defaultCameraSideClipUniform,
) => {
  shader.uniforms.cameraSideClipEnabled = cameraSideClipUniform;
  shader.vertexShader = shader.vertexShader
    .replace(
      "#include <common>",
      `#include <common>
       uniform float cameraSideClipEnabled;`,
    )
    .replace(
      "#include <project_vertex>",
      `#include <project_vertex>
       vec3 starWorldPosition =
         (modelMatrix * vec4(transformed, 1.0)).xyz;
       float starCameraAlignment = dot(
         normalize(starWorldPosition),
         normalize(cameraPosition)
       );
       if (cameraSideClipEnabled > 0.5
         && starCameraAlignment
         > ${CAMERA_SIDE_CLIP_ALIGNMENT.toFixed(6)}) {
         gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
       }`,
    );
};

export const constellationLineShaderModification = (
  shader: WebGLProgramParametersWithUniforms,
  cameraSideClipUniform: CameraSideClipUniform =
  defaultCameraSideClipUniform,
  constellationDebugUniform: ConstellationDebugUniform =
  defaultConstellationDebugUniform,
) => {
  shader.uniforms.constellationTime = constellationTimeUniform;
  shader.uniforms.cameraSideClipEnabled = cameraSideClipUniform;
  shader.uniforms.constellationDebug = constellationDebugUniform;
  shader.vertexShader = shader.vertexShader
    .replace(
      "#include <common>",
      `#include <common>
       uniform float constellationTime;
       uniform float constellationDebug;
       attribute vec3 constellationLineStart;
       attribute float constellationStartTime;
       attribute float constellationSegmentStart;
       attribute float constellationSegmentEnd;
       varying float vConstellationCameraAlignment;
       varying float vConstellationVisibility;`,
    )
    .replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
       float constellationLocalTime =
         constellationTime - constellationStartTime;
       float constellationGrow = smoothstep(
         0.0,
         ${CONSTELLATION_DRAW_SECONDS.toFixed(1)},
         constellationLocalTime
       );
       float constellationFade = 1.0 - smoothstep(
         ${(CONSTELLATION_DRAW_SECONDS
        + CONSTELLATION_HOLD_SECONDS).toFixed(1)},
         ${CONSTELLATION_EVENT_SECONDS.toFixed(1)},
         constellationLocalTime
       );
       float constellationProgress = constellationGrow;
       float constellationSegmentProgress = smoothstep(
         constellationSegmentStart,
         constellationSegmentEnd,
         constellationProgress
       );
       vConstellationVisibility = mix(
         constellationSegmentProgress * constellationFade,
         1.0,
         constellationDebug
       );
       transformed = mix(
         constellationLineStart,
         transformed,
         max(constellationSegmentProgress, constellationDebug)
       );`,
    )
    .replace(
      "#include <project_vertex>",
      `#include <project_vertex>
       vec3 constellationWorldPosition =
         (modelMatrix * vec4(transformed, 1.0)).xyz;
       vConstellationCameraAlignment = dot(
         normalize(constellationWorldPosition),
         normalize(cameraPosition)
       );`,
    );
  shader.fragmentShader = shader.fragmentShader
    .replace(
      "#include <common>",
      `#include <common>
       uniform float cameraSideClipEnabled;
       varying float vConstellationCameraAlignment;
       varying float vConstellationVisibility;`,
    )
    .replace(
      "#include <color_fragment>",
      `#include <color_fragment>
       diffuseColor.a *= vConstellationVisibility;`,
    )
    .replace(
      "#include <clipping_planes_fragment>",
      `#include <clipping_planes_fragment>
       if (cameraSideClipEnabled > 0.5
         && vConstellationCameraAlignment
         > ${CAMERA_SIDE_CLIP_ALIGNMENT.toFixed(6)}) {
         discard;
       }`,
    );
};

export const constellationImageShaderModification = (
  shader: WebGLProgramParametersWithUniforms,
  cameraSideClipUniform: CameraSideClipUniform =
  defaultCameraSideClipUniform,
  constellationDebugUniform: ConstellationDebugUniform =
  defaultConstellationDebugUniform,
) => {
  shader.uniforms.constellationTime = constellationTimeUniform;
  shader.uniforms.cameraSideClipEnabled = cameraSideClipUniform;
  shader.uniforms.constellationDebug = constellationDebugUniform;
  shader.vertexShader = shader.vertexShader
    .replace(
      "#include <common>",
      `#include <common>
       uniform float constellationTime;
       uniform float constellationDebug;
       attribute float constellationStartTime;
       varying float vConstellationImageCameraAlignment;
       varying float vConstellationImageVisibility;`,
    )
    .replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
       float constellationImageTime =
         constellationTime
         - constellationStartTime
         - ${CONSTELLATION_DRAW_SECONDS.toFixed(1)};
       float constellationImageFadeIn = smoothstep(
         0.0,
         ${CONSTELLATION_IMAGE_FADE_IN_SECONDS.toFixed(2)},
         constellationImageTime
       );
       float constellationImageFadeOut = 1.0 - smoothstep(
         ${CONSTELLATION_IMAGE_FADE_IN_SECONDS.toFixed(2)},
         ${CONSTELLATION_IMAGE_FADE_SECONDS.toFixed(1)},
         constellationImageTime
       );
       vConstellationImageVisibility = mix(
         constellationImageFadeIn * constellationImageFadeOut,
         1.0,
         constellationDebug
       );`,
    )
    .replace(
      "#include <project_vertex>",
      `#include <project_vertex>
       vec3 constellationImageWorldPosition =
         (modelMatrix * vec4(transformed, 1.0)).xyz;
       vConstellationImageCameraAlignment = dot(
         normalize(constellationImageWorldPosition),
         normalize(cameraPosition)
       );`,
    );
  shader.fragmentShader = shader.fragmentShader
    .replace(
      "#include <common>",
      `#include <common>
       uniform float cameraSideClipEnabled;
       varying float vConstellationImageCameraAlignment;
       varying float vConstellationImageVisibility;`,
    )
    .replace(
      "#include <map_fragment>",
      `#include <map_fragment>
       float constellationImageLuminance = dot(
         diffuseColor.rgb,
         vec3(0.2126, 0.7152, 0.0722)
       );
       diffuseColor.rgb = vec3(constellationImageLuminance);
       diffuseColor.a *= vConstellationImageVisibility;`,
    )
    .replace(
      "#include <clipping_planes_fragment>",
      `#include <clipping_planes_fragment>
       if (cameraSideClipEnabled > 0.5
         && vConstellationImageCameraAlignment
         > ${CAMERA_SIDE_CLIP_ALIGNMENT.toFixed(6)}) {
         discard;
       }`,
    );
};

export const starShaderModification = (
  shader: WebGLProgramParametersWithUniforms,
  cameraSideClipUniform: CameraSideClipUniform =
  defaultCameraSideClipUniform,
) => {
  cameraSideShaderModification(shader, cameraSideClipUniform);
  shader.vertexShader = shader.vertexShader.replace(
    "#include <common>",
    `#include <common>
     attribute float starSize;`,
  )
    .replace(
      "gl_PointSize = size;",
      "gl_PointSize = size * starSize;",
    );
};

export interface ConstellationsProps {
  enabled: boolean;
  debug: boolean;
  nightFactor: number;
  cameraSideClipEnabled: boolean;
  discoveryEnabled: boolean;
  onConstellationFound?(cropSlug: string): void;
}

export interface ConstellationsHandle {
  setNightFactor(nightFactor: number): void;
}

interface ConstellationImagesProps {
  imagesRef: React.RefObject<Material | null>;
  modifyShader(shader: WebGLProgramParametersWithUniforms): void;
  nightFactor: number;
  runtime: ConstellationRuntime;
}

export interface ConstellationMaterialRefs {
  backgroundStars: React.RefObject<Material | null>;
  constellationStars: React.RefObject<Material | null>;
  lines: React.RefObject<Material | null>;
  images: React.RefObject<Material | null>;
}

export const setConstellationNightFactor = (
  refs: ConstellationMaterialRefs,
  factor: number,
) => {
  if (refs.backgroundStars.current) {
    refs.backgroundStars.current.opacity = factor;
  }
  if (refs.constellationStars.current) {
    refs.constellationStars.current.opacity = factor;
  }
  if (refs.lines.current) {
    refs.lines.current.opacity = factor * CONSTELLATION_LINE_OPACITY;
  }
  if (refs.images.current) {
    refs.images.current.opacity = factor * CONSTELLATION_IMAGE_OPACITY;
  }
};

const ConstellationImages = (props: ConstellationImagesProps) => {
  const { imagesRef, modifyShader, nightFactor, runtime } = props;
  const firstConstellation = runtime.catalog.constellations[0];
  const texture = useTexture(getPlantIconTextureUrl(
    cropIconUrl(firstConstellation.cropSlug),
  ));
  return <Mesh
    geometry={getConstellationImageGeometry(runtime)}
    renderOrder={-1}
    frustumCulled={false}
    // eslint-disable-next-line no-null/no-null
    dispose={null}>
    <MeshBasicMaterial
      ref={imagesRef}
      map={texture}
      color={"white"}
      transparent={true}
      opacity={nightFactor * CONSTELLATION_IMAGE_OPACITY}
      onBeforeCompile={modifyShader}
      depthWrite={false} />
  </Mesh>;
};

interface LoadedConstellationsProps extends ConstellationsProps {
  catalog: CropConstellationCatalog;
}

interface ConstellationAnimatorProps {
  runtime: ConstellationRuntime;
  state: ConstellationAnimationState;
  cameraSideClipEnabled: boolean;
  discoveryEnabled: boolean;
  onConstellationFound?(cropSlug: string): void;
}

const ConstellationAnimator = (props: ConstellationAnimatorProps) => {
  const discoveryStateRef = React.useRef(createConstellationDiscoveryState());
  useFrame(frameState => {
    const now = frameState.clock.elapsedTime;
    advanceConstellationAnimation(props.runtime, props.state, now);
    if (!props.discoveryEnabled || !props.onConstellationFound) { return; }
    discoverConstellationsInView({
      runtime: props.runtime,
      animationState: props.state,
      discoveryState: discoveryStateRef.current,
      camera: frameState.camera,
      now,
      cameraSideClipEnabled: props.cameraSideClipEnabled,
      onConstellationFound: props.onConstellationFound,
    });
  });
  return <></>;
};

export const LoadedConstellations = React.forwardRef<
  ConstellationsHandle,
  LoadedConstellationsProps
>((props, ref) => {
  const { catalog, nightFactor } = props;
  // eslint-disable-next-line no-null/no-null
  const backgroundStarsRef = React.useRef<Material>(null);
  // eslint-disable-next-line no-null/no-null
  const constellationStarsRef = React.useRef<Material>(null);
  // eslint-disable-next-line no-null/no-null
  const linesRef = React.useRef<Material>(null);
  // eslint-disable-next-line no-null/no-null
  const imagesRef = React.useRef<Material>(null);
  const runtime = getConstellationRuntime(catalog);
  const animationState = React.useMemo(
    () => createConstellationAnimationState(catalog),
    [catalog],
  );
  const cameraSideClipUniformRef = React.useRef({
    value: props.cameraSideClipEnabled ? 1 : 0,
  });
  const constellationDebugUniformRef = React.useRef({
    value: props.debug ? 1 : 0,
  });
  React.useLayoutEffect(() => {
    cameraSideClipUniformRef.current.value =
      props.cameraSideClipEnabled ? 1 : 0;
  }, [props.cameraSideClipEnabled]);
  const modifyConstellationImageShader = React.useCallback(
    (shader: WebGLProgramParametersWithUniforms) =>
      constellationImageShaderModification(
        shader,
        cameraSideClipUniformRef.current,
        constellationDebugUniformRef.current,
      ),
    [],
  );
  const modifyConstellationLineShader = React.useCallback(
    (shader: WebGLProgramParametersWithUniforms) =>
      constellationLineShaderModification(
        shader,
        cameraSideClipUniformRef.current,
        constellationDebugUniformRef.current,
      ),
    [],
  );
  const modifyStarShader = React.useCallback(
    (shader: WebGLProgramParametersWithUniforms) =>
      starShaderModification(shader, cameraSideClipUniformRef.current),
    [],
  );

  React.useImperativeHandle(ref, () => ({
    setNightFactor: factor => setConstellationNightFactor({
      backgroundStars: backgroundStarsRef,
      constellationStars: constellationStarsRef,
      lines: linesRef,
      images: imagesRef,
    }, factor),
  }), []);

  React.useLayoutEffect(() => {
    constellationDebugUniformRef.current.value = props.debug ? 1 : 0;
    if (props.enabled) {
      resetConstellationAnimation(runtime, animationState);
    }
  }, [animationState, props.debug, props.enabled, runtime]);

  const showConstellations = props.enabled || props.debug;
  return <>
    {props.enabled && !props.debug && <ConstellationAnimator
      runtime={runtime}
      state={animationState}
      cameraSideClipEnabled={props.cameraSideClipEnabled}
      discoveryEnabled={props.discoveryEnabled}
      onConstellationFound={props.onConstellationFound} />}
    {showConstellations && <>
      <React.Suspense fallback={undefined}>
        <ConstellationImages
          imagesRef={imagesRef}
          modifyShader={modifyConstellationImageShader}
          nightFactor={nightFactor}
          runtime={runtime} />
      </React.Suspense>
      <LineSegments
        geometry={getConstellationLineGeometry(runtime)}
        renderOrder={0}>
        <LineBasicMaterial
          ref={linesRef}
          color={"white"}
          transparent={true}
          opacity={nightFactor * CONSTELLATION_LINE_OPACITY}
          onBeforeCompile={modifyConstellationLineShader}
          depthWrite={false} />
      </LineSegments>
      <Points
        geometry={getConstellationStarGeometry(runtime)}
        renderOrder={1}
        // eslint-disable-next-line no-null/no-null
        dispose={null}>
        <PointsMaterial
          ref={constellationStarsRef}
          color={"white"}
          size={1}
          sizeAttenuation={false}
          transparent={true}
          opacity={nightFactor}
          onBeforeCompile={modifyStarShader}
          depthWrite={false} />
      </Points>
    </>}
    <Points
      geometry={getBackgroundStarGeometry(runtime)}
      renderOrder={1}
      // eslint-disable-next-line no-null/no-null
      dispose={null}>
      <PointsMaterial
        ref={backgroundStarsRef}
        color={"white"}
        size={1}
        sizeAttenuation={false}
        transparent={true}
        opacity={nightFactor}
        onBeforeCompile={modifyStarShader}
        depthWrite={false} />
    </Points>
  </>;
});

LoadedConstellations.displayName = "LoadedConstellations";

const CatalogConstellations = React.forwardRef<
  ConstellationsHandle,
  ConstellationsProps
>((props, ref) => {
  const catalog = readCropConstellationCatalog();
  return <LoadedConstellations
    ref={ref}
    catalog={catalog}
    {...props} />;
});

CatalogConstellations.displayName = "CatalogConstellations";

export const Constellations = React.forwardRef<
  ConstellationsHandle,
  ConstellationsProps
>((props, ref) => {
  const backgroundStars = <LoadedConstellations
    ref={ref}
    catalog={BACKGROUND_STAR_CATALOG}
    {...props}
    enabled={false}
    debug={false} />;
  if (!props.enabled && !props.debug) {
    return backgroundStars;
  }
  return <ErrorBoundary fallback={backgroundStars}>
    <React.Suspense fallback={backgroundStars}>
      <CatalogConstellations ref={ref} {...props} />
    </React.Suspense>
  </ErrorBoundary>;
});

Constellations.displayName = "Constellations";
