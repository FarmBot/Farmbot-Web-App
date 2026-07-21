import React from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { range } from "lodash";
import * as THREE from "three";
import { CameraOperation, Config } from "../../config";
import {
  Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, Primitive,
} from "../../components";
import { getGardenPositionFunc, zZero } from "../../helpers";
import {
  CALIBRATION_CARD_FRONT_CIRCLES, CALIBRATION_CARD_FRONT_LINES,
  CALIBRATION_CARD_GRID_DOTS, CALIBRATION_CARD_HEIGHT,
  CALIBRATION_CARD_WIDTH, CalibrationCardCircleData,
  CalibrationCardLineData,
} from "../../../photos/camera_calibration/calibration_card";
import {
  LineSegments2,
} from "three/examples/jsm/lines/LineSegments2.js";
import {
  LineSegmentsGeometry,
} from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

export const CAMERA_SCAN_PASS_SECONDS = 1.5;
export const CAMERA_SOIL_GRID_SPACING = 50;
export const CAMERA_SOIL_GRID_MAX_OFFSET = 30;
export const CAMERA_SOIL_GRID_LINE_WIDTH = 3;
export const CAMERA_CALIBRATION_CARD_Z_OFFSET = 10;

type ActiveCameraOperation = Exclude<CameraOperation, "">;

export const CAMERA_LASER_COLORS: Record<ActiveCameraOperation, string> = {
  calibration: "#009dff",
  weeds: "#ff0000",
  "soil-height": "#8b4513",
};

export interface CameraOperationAnimationsProps {
  operation: ActiveCameraOperation;
  operationId: number;
  points: THREE.Vector3[];
  cameraPosition: THREE.Vector3;
  config: Config;
  getZ(x: number, y: number): number;
}

type CameraSoilSurfaceProps = Pick<CameraOperationAnimationsProps,
  "points" | "cameraPosition" | "config" | "getZ">;

export interface CameraScanState {
  pass: number;
  progress: number;
}

export const cameraScanState = (elapsedSeconds: number): CameraScanState => {
  const scanPosition = Math.max(0, elapsedSeconds) / CAMERA_SCAN_PASS_SECONDS;
  const pass = Math.floor(scanPosition);
  const phase = scanPosition - pass;
  return {
    pass,
    progress: pass % 2 == 0 ? phase : 1 - phase,
  };
};

export const cameraWeedScanProgress = (
  elapsedSeconds: number,
  durationSeconds: number,
) => {
  const phase = THREE.MathUtils.clamp(
    elapsedSeconds / durationSeconds,
    0,
    1,
  );
  return phase <= 0.5 ? phase * 2 : (1 - phase) * 2;
};

const bottomPoint = (
  points: THREE.Vector3[],
  u: number,
  v: number,
) => {
  const bottomLeft = points[4].clone().lerp(points[6], u);
  const bottomRight = points[5].clone().lerp(points[7], u);
  return bottomLeft.lerp(bottomRight, v);
};

export const cameraScanTriangle = (
  points: THREE.Vector3[],
  progress: number,
): [THREE.Vector3, THREE.Vector3, THREE.Vector3] => {
  const value = THREE.MathUtils.clamp(progress, 0, 1);
  const uLength = points[4].distanceTo(points[6]);
  const vLength = points[4].distanceTo(points[5]);
  const scanEdge = uLength >= vLength
    ? [bottomPoint(points, 0, value), bottomPoint(points, 1, value)]
    : [bottomPoint(points, value, 0), bottomPoint(points, value, 1)];
  return [new THREE.Vector3(), ...scanEdge] as [
    THREE.Vector3,
    THREE.Vector3,
    THREE.Vector3,
  ];
};

const updateTriangleGeometry = (
  geometry: THREE.BufferGeometry,
  points: THREE.Vector3[],
  progress: number,
) => {
  const position = geometry.getAttribute("position") as THREE.BufferAttribute;
  cameraScanTriangle(points, progress).forEach((point, index) =>
    position.setXYZ(index, point.x, point.y, point.z));
  position.needsUpdate = true;
};

const LaserScanPlane = (props: CameraOperationAnimationsProps) => {
  const geometry = React.useMemo(() => {
    const result = new THREE.BufferGeometry().setFromPoints(
      cameraScanTriangle(props.points, 0),
    );
    result.computeBoundingSphere();
    return result;
  }, [props.points]);
  const startedAt = React.useRef<number | undefined>(undefined);
  React.useLayoutEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(state => {
    const now = state.clock.getElapsedTime();
    startedAt.current ??= now;
    const elapsed = props.config.animate ? now - startedAt.current : 0;
    updateTriangleGeometry(
      geometry,
      props.points,
      props.operation == "weeds"
        ? cameraWeedScanProgress(
          elapsed,
          props.config.cameraOperationDurationMs / 1000,
        )
        : cameraScanState(elapsed).progress,
    );
  });
  return <Mesh name={"camera-laser-scan-plane"}
    geometry={geometry}
    frustumCulled={false}>
    <MeshBasicMaterial
      color={CAMERA_LASER_COLORS[props.operation]}
      side={THREE.DoubleSide}
      blending={THREE.AdditiveBlending}
      transparent={true}
      opacity={0.4}
      depthWrite={false} />
  </Mesh>;
};

const soilLocalZ = (
  point: THREE.Vector3,
  props: CameraSoilSurfaceProps,
) => {
  const worldPosition = point.clone().add(props.cameraPosition);
  const gardenPosition = getGardenPositionFunc(props.config, false)({
    x: worldPosition.x,
    y: worldPosition.y,
  });
  return zZero(props.config)
    + props.getZ(gardenPosition.x, gardenPosition.y)
    - props.cameraPosition.z;
};

interface CameraSoilGrid {
  nodes: THREE.Vector3[];
  edges: [number, number][];
}

export const cameraSoilGrid = (
  props: CameraSoilSurfaceProps,
): CameraSoilGrid => {
  const uSegments = Math.max(1, Math.ceil(
    props.points[4].distanceTo(props.points[6]) / CAMERA_SOIL_GRID_SPACING,
  ));
  const vSegments = Math.max(1, Math.ceil(
    props.points[4].distanceTo(props.points[5]) / CAMERA_SOIL_GRID_SPACING,
  ));
  const nodeIndex = (u: number, v: number) =>
    u * (vSegments + 1) + v;
  const nodes = range(uSegments + 1).flatMap(u =>
    range(vSegments + 1).map(v => {
      const point = bottomPoint(props.points, u / uSegments, v / vSegments);
      point.z = soilLocalZ(point, props);
      return point;
    }));
  const edges: [number, number][] = [];
  range(uSegments + 1).forEach(u =>
    range(vSegments).forEach(v => edges.push([
      nodeIndex(u, v),
      nodeIndex(u, v + 1),
    ])));
  range(uSegments).forEach(u =>
    range(vSegments + 1).forEach(v => edges.push([
      nodeIndex(u, v),
      nodeIndex(u + 1, v),
    ])));
  return { nodes, edges };
};

const randomUnit = (value: number) => {
  const raw = Math.sin(value * 12.9898) * 43758.5453;
  return raw - Math.floor(raw);
};

export const cameraGridHeightOffset = (
  nodeIndex: number,
  elapsedSeconds: number,
  seed: number,
) => CAMERA_SOIL_GRID_MAX_OFFSET / 2 * (
  1 + Math.sin(
    elapsedSeconds * (1.5 + randomUnit(seed + nodeIndex) * 2)
    + randomUnit(seed * 7 + nodeIndex * 13) * Math.PI * 2,
  ));

const gridPositions = (
  grid: CameraSoilGrid,
  elapsedSeconds: number,
  seed: number,
  target?: Float32Array<ArrayBufferLike>,
) => {
  const positions = target || new Float32Array(grid.edges.length * 2 * 3);
  let valueIndex = 0;
  grid.edges.forEach(edge => edge.forEach(nodeIndex => {
    const point = grid.nodes[nodeIndex];
    positions[valueIndex++] = point.x;
    positions[valueIndex++] = point.y;
    positions[valueIndex++] = point.z
      + cameraGridHeightOffset(nodeIndex, elapsedSeconds, seed);
  }));
  return positions;
};

const SoilHeightGrid = (props: CameraOperationAnimationsProps) => {
  const { size } = useThree();
  const { cameraPosition, config, getZ, points } = props;
  const grid = React.useMemo(() => cameraSoilGrid({
    cameraPosition,
    config,
    getZ,
    points,
  }), [
    cameraPosition,
    config,
    getZ,
    points,
  ]);
  const geometry = React.useMemo(() => {
    const result = new LineSegmentsGeometry();
    result.setPositions(gridPositions(grid, 0, props.operationId));
    const position = result.getAttribute("instanceStart") as
      THREE.InterleavedBufferAttribute;
    position.data.setUsage(THREE.DynamicDrawUsage);
    return result;
  }, [grid, props.operationId]);
  const material = React.useMemo(() => new LineMaterial({
    color: "#ffffff",
    linewidth: CAMERA_SOIL_GRID_LINE_WIDTH,
    worldUnits: true,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  }), []);
  const line = React.useMemo(() => {
    const result = new LineSegments2(geometry, material);
    result.name = "camera-soil-height-grid";
    result.frustumCulled = false;
    return result;
  }, [geometry, material]);
  const startedAt = React.useRef<number | undefined>(undefined);
  React.useEffect(() => {
    material.resolution.set(size.width, size.height);
  }, [material, size.height, size.width]);
  React.useLayoutEffect(() => () => geometry.dispose(), [geometry]);
  React.useLayoutEffect(() => () => material.dispose(), [material]);
  useFrame(state => {
    const now = state.clock.getElapsedTime();
    startedAt.current ??= now;
    const position = geometry.getAttribute("instanceStart") as
      THREE.InterleavedBufferAttribute;
    gridPositions(
      grid,
      props.config.animate ? now - startedAt.current : 0,
      props.operationId,
      position.data.array as Float32Array<ArrayBufferLike>,
    );
    position.needsUpdate = true;
  });
  return <Primitive name={"camera-soil-height-grid"} object={line} />;
};

const cardPoint = (x: number, y: number): [number, number] => [
  x - CALIBRATION_CARD_WIDTH / 2,
  CALIBRATION_CARD_HEIGHT / 2 - y,
];

const CalibrationCardCircle = (props: {
  circle: CalibrationCardCircleData;
  name: string;
}) => {
  const [x, y] = cardPoint(props.circle.x, props.circle.y);
  return <Mesh name={props.name} position={[x, y, 0.1]}>
    <circleGeometry args={[props.circle.radius, 24]} />
    <MeshBasicMaterial color={props.circle.color} />
  </Mesh>;
};

const CalibrationCardLine = (props: {
  line: CalibrationCardLineData;
  index: number;
}) => {
  const [x1, y1] = cardPoint(props.line.x1, props.line.y1);
  const [x2, y2] = cardPoint(props.line.x2, props.line.y2);
  const length = Math.hypot(x2 - x1, y2 - y1);
  return <Mesh name={`camera-calibration-card-line-${props.index}`}
    position={[(x1 + x2) / 2, (y1 + y2) / 2, 0.1]}
    rotation={[0, 0, Math.atan2(y2 - y1, x2 - x1)]}>
    <boxGeometry args={[length, props.line.width, 0.2]} />
    <MeshBasicMaterial color={props.line.color} />
  </Mesh>;
};

const CalibrationCardFront = () => {
  const [ringX, ringY] = cardPoint(66, 64);
  return <>
    {CALIBRATION_CARD_FRONT_CIRCLES.map((circle, index) =>
      <CalibrationCardCircle key={index}
        name={`camera-calibration-card-front-circle-${index}`}
        circle={circle} />)}
    <Mesh name={"camera-calibration-card-center-ring"}
      position={[ringX, ringY, 0.1]}>
      <ringGeometry args={[8, 10, 32]} />
      <MeshBasicMaterial color={"cyan"} />
    </Mesh>
    {CALIBRATION_CARD_FRONT_LINES.map((line, index) =>
      <CalibrationCardLine key={index} line={line} index={index} />)}
  </>;
};

const CalibrationCardBack = () => <>
  {CALIBRATION_CARD_GRID_DOTS.map((circle, index) =>
    <CalibrationCardCircle key={index}
      name={`camera-calibration-card-grid-dot-${index}`}
      circle={circle} />)}
</>;

const CalibrationCard = (props: CameraOperationAnimationsProps) => {
  const center = bottomPoint(props.points, 0.5, 0.5);
  center.z = soilLocalZ(center, props) + CAMERA_CALIBRATION_CARD_Z_OFFSET;
  const edge = props.points[6].clone().sub(props.points[4]);
  return <Group name={"camera-calibration-card"}
    position={center}
    rotation={[0, 0, Math.atan2(edge.y, edge.x)]}>
    <Mesh name={"camera-calibration-card-base"} position={[0, 0, -2]}>
      <boxGeometry args={[
        CALIBRATION_CARD_WIDTH,
        CALIBRATION_CARD_HEIGHT,
        4,
      ]} />
      <MeshStandardMaterial color={"#333"} />
    </Mesh>
    {props.config.calibrationCardGrid
      ? <CalibrationCardBack />
      : <CalibrationCardFront />}
  </Group>;
};

export const CameraOperationAnimations = (
  props: CameraOperationAnimationsProps,
) => {
  const [visible, setVisible] = React.useState(true);
  React.useEffect(() => {
    const timer = window.setTimeout(
      () => setVisible(false),
      props.config.cameraOperationDurationMs,
    );
    return () => window.clearTimeout(timer);
  }, [props.config.cameraOperationDurationMs]);
  if (!visible) { return <></>; }
  return <Group name={"camera-operation-animation"}>
    <LaserScanPlane {...props} />
    {props.operation == "calibration" && <CalibrationCard {...props} />}
    {props.operation == "soil-height" && <SoilHeightGrid {...props} />}
  </Group>;
};
