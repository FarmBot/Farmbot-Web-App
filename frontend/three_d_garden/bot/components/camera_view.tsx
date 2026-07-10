import React from "react";
import * as THREE from "three";
import { Config, PositionConfig } from "../../config";
import {
  LineBasicMaterial, LineSegments, Mesh, MeshStandardMaterial,
} from "../../components";
import { ConvexGeometry } from "three-stdlib";
import { extraRotation } from "../../garden/images";
import { useSpring, animated } from "@react-spring/three";
import { getBotVersion } from "../bot_versions";
import { updateBufferGeometry } from "./owned_extrude_geometry";
import { perfCount } from "../../../performance/perf";

const AnimatedMesh = animated(Mesh);
const AnimatedMeshStandardMaterial = animated(MeshStandardMaterial);
const zMountedCameraMountOffset = {
  x: 12,
  y: 35,
};
const zMountedCameraMountToLensOffset = new THREE.Vector3(
  0,
  29,
  0,
);
const noCameraOffset = new THREE.Vector3(0, 0, 0);

type V3 = [number, number, number];

const lensSize = 2.5;

const toV = (point: V3) => {
  const [x, y, z] = point;
  return new THREE.Vector3(x, y, z);
};

const rotatePoint = (
  point: V3,
  angleDegrees: number,
  center: THREE.Vector3,
) => toV(point)
  .sub(center)
  .applyAxisAngle(toV([0, 0, 1]), angleDegrees * Math.PI / 180)
  .add(center);

export interface CameraViewProps {
  config: Config;
  configPosition: PositionConfig;
  distanceToSoil: number;
  cameraMountPosition: THREE.Vector3;
}

type CameraViewPointConfig = Pick<Config,
  "negativeZ"
  | "kitVersion"
  | "imgCenterX"
  | "imgCenterY"
  | "imgScale"
  | "imgOffsetX"
  | "imgOffsetY"
  | "imgRotation"
  | "imgOrigin">;

interface CameraViewPointInputs extends CameraViewPointConfig {
  configZ: number;
  distanceToSoil: number;
  cameraMountX: number;
  cameraMountY: number;
  cameraMountZ: number;
}

const getCameraViewPointsFromInputs = (inputs: CameraViewPointInputs) => {
  const {
    negativeZ,
    kitVersion,
    imgCenterX,
    imgCenterY,
    imgScale,
    imgOffsetX,
    imgOffsetY,
    imgRotation,
    configZ,
    distanceToSoil,
    cameraMountX,
    cameraMountY,
    cameraMountZ,
  } = inputs;
  const isV19 = getBotVersion(kitVersion).number == "v1.9";
  const cameraMountOffset = isV19
    ? { x: 0, y: 0 }
    : zMountedCameraMountOffset;
  const cameraMountToLensOffset = isV19
    ? noCameraOffset
    : zMountedCameraMountToLensOffset;
  const cameraLensPosition = new THREE.Vector3(
    cameraMountX,
    cameraMountY,
    cameraMountZ,
  )
    .add(cameraMountToLensOffset);
  const soilZ = distanceToSoil + (isV19
    ? 0
    : (negativeZ ? -1 : 1) * configZ);

  const widthAtSoilFromZero = imgCenterX * 2 * imgScale;
  const heightAtSoilFromZero = imgCenterY * 2 * imgScale;
  const heightAngle = Math.atan2(heightAtSoilFromZero / 2, soilZ);
  const widthAngle = Math.atan2(widthAtSoilFromZero / 2, soilZ);
  const yEdgeAtSoil = distanceToSoil * Math.tan(heightAngle);
  const xEdgeAtSoil = distanceToSoil * Math.tan(widthAngle);

  const topCenter = toV([0, 0, 0]);

  const xCenter = -cameraMountOffset.x - cameraMountToLensOffset.x;
  const yCenter = -cameraMountOffset.y - cameraMountToLensOffset.y;
  const bottomCenter = toV([xCenter, yCenter, 0]);

  const offset = toV([imgOffsetX, imgOffsetY, 0]);

  const rotation = imgRotation + extraRotation(inputs);
  const rotateTop = (point: V3) =>
    rotatePoint(point, rotation, topCenter);
  const rotateBottom = (point: V3) =>
    rotatePoint(point, rotation, bottomCenter).add(offset);

  const TUL = [-lensSize, -lensSize, 0];
  const TUR = [-lensSize, lensSize, 0];
  const TLL = [lensSize, -lensSize, 0];
  const TLR = [lensSize, lensSize, 0];
  const TOP = ([TUL, TUR, TLL, TLR] as V3[]).map(rotateTop);

  const BUL = [xCenter - xEdgeAtSoil, yCenter - yEdgeAtSoil, -distanceToSoil];
  const BUR = [xCenter - xEdgeAtSoil, yCenter + yEdgeAtSoil, -distanceToSoil];
  const BLL = [xCenter + xEdgeAtSoil, yCenter - yEdgeAtSoil, -distanceToSoil];
  const BLR = [xCenter + xEdgeAtSoil, yCenter + yEdgeAtSoil, -distanceToSoil];
  const BOTTOM = ([BUL, BUR, BLL, BLR] as V3[]).map(rotateBottom);

  return {
    cameraLensPosition,
    points: [
      ...TOP,
      ...BOTTOM,
    ],
  };
};

export const getCameraViewPoints = (props: CameraViewProps) => {
  const { config, configPosition, distanceToSoil, cameraMountPosition } = props;
  return getCameraViewPointsFromInputs({
    negativeZ: config.negativeZ,
    kitVersion: config.kitVersion,
    imgCenterX: config.imgCenterX,
    imgCenterY: config.imgCenterY,
    imgScale: config.imgScale,
    imgOffsetX: config.imgOffsetX,
    imgOffsetY: config.imgOffsetY,
    imgRotation: config.imgRotation,
    imgOrigin: config.imgOrigin,
    configZ: configPosition.z,
    distanceToSoil,
    cameraMountX: cameraMountPosition.x,
    cameraMountY: cameraMountPosition.y,
    cameraMountZ: cameraMountPosition.z,
  });
};

const CameraViewBase = (props: CameraViewProps) => {
  const { config, configPosition, distanceToSoil, cameraMountPosition } = props;
  const {
    negativeZ, kitVersion,
    imgCenterX,
    imgCenterY,
    imgScale,
    imgOffsetX,
    imgOffsetY,
    imgRotation,
    imgOrigin,
  } = config;
  const { x: cameraMountX, y: cameraMountY, z: cameraMountZ } =
    cameraMountPosition;
  const configZ = configPosition.z;
  const { cameraLensPosition, points } = React.useMemo(() =>
    getCameraViewPointsFromInputs({
      negativeZ,
      kitVersion,
      imgCenterX,
      imgCenterY,
      imgScale,
      imgOffsetX,
      imgOffsetY,
      imgRotation,
      imgOrigin,
      configZ,
      distanceToSoil,
      cameraMountX,
      cameraMountY,
      cameraMountZ,
    }), [
    negativeZ,
    kitVersion,
    imgCenterX,
    imgCenterY,
    imgScale,
    imgOffsetX,
    imgOffsetY,
    imgRotation,
    imgOrigin,
    configZ,
    distanceToSoil,
    cameraMountX,
    cameraMountY,
    cameraMountZ,
  ]);
  return config.cameraView
    ? <Frustum points={points} position={cameraLensPosition} config={config} />
    : <></>;
};

const CAMERA_VIEW_CONFIG_FIELDS: (keyof Config)[] = [
  "cameraView",
  "imgCenterX",
  "imgCenterY",
  "imgOffsetX",
  "imgOffsetY",
  "imgOrigin",
  "imgRotation",
  "imgScale",
  "lastImageCapture",
  "negativeZ",
  "kitVersion",
];

export const cameraViewPropsEqual = (
  prev: CameraViewProps,
  next: CameraViewProps,
) =>
  prev.distanceToSoil === next.distanceToSoil &&
  prev.configPosition.z === next.configPosition.z &&
  prev.cameraMountPosition.x === next.cameraMountPosition.x &&
  prev.cameraMountPosition.y === next.cameraMountPosition.y &&
  prev.cameraMountPosition.z === next.cameraMountPosition.z &&
  CAMERA_VIEW_CONFIG_FIELDS.every(field =>
    prev.config[field] === next.config[field]);

export const CameraView = React.memo(CameraViewBase, cameraViewPropsEqual);

interface FrustumProps {
  points: THREE.Vector3[];
  position: THREE.Vector3;
  config: Config;
}

const frustumEdgesGeometry = (points: THREE.Vector3[]) => {
  const pairs = [
    [0, 1], [0, 2], [1, 3], [2, 3],
    [4, 5], [4, 6], [5, 7], [6, 7],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  return new THREE.BufferGeometry().setFromPoints(
    pairs.flatMap(([start, end]) => [points[start], points[end]]),
  );
};

const Frustum = (props: FrustumProps) => {
  const geometryKey = props.points.flatMap(point =>
    point.toArray().map(coordinate => Math.round(coordinate))).join(":");
  const [geometry] = React.useState(() => {
    perfCount("bot.geometry.cameraView");
    const g = new ConvexGeometry(props.points);
    g.computeVertexNormals();
    g.computeBoundingSphere();
    return g;
  });
  const [edgesGeometry] = React.useState(() => {
    perfCount("bot.geometry.cameraViewEdges");
    return frustumEdgesGeometry(props.points);
  });
  const geometryKeyRef = React.useRef(geometryKey);
  React.useLayoutEffect(() => {
    if (geometryKeyRef.current == geometryKey) { return; }
    perfCount("bot.geometry.cameraView");
    const replacement = new ConvexGeometry(props.points);
    replacement.computeVertexNormals();
    replacement.computeBoundingSphere();
    updateBufferGeometry(geometry, replacement);
    replacement.dispose();
    perfCount("bot.geometry.cameraViewEdges");
    const replacementEdges = frustumEdgesGeometry(props.points);
    updateBufferGeometry(edgesGeometry, replacementEdges);
    replacementEdges.dispose();
    geometryKeyRef.current = geometryKey;
  }, [edgesGeometry, geometry, geometryKey, props.points]);
  React.useLayoutEffect(() => () => {
    geometry.dispose();
    edgesGeometry.dispose();
  }, [edgesGeometry, geometry]);

  const baseOpacity = 0.25;
  const [spring, api] = useSpring(() => ({ opacity: baseOpacity }));
  const { lastImageCapture } = props.config;
  React.useEffect(() => {
    if (!lastImageCapture) { return; }
    api.start({
      to: async (next) => {
        await next({ opacity: 0.9, immediate: true });
        await next({
          opacity: baseOpacity,
          delay: 0,
          config: {
            duration: 1000,
            tension: 20,
            friction: 30,
          },
        });
      },
      reset: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastImageCapture]);

  return <AnimatedMesh name={"camera-view"}
    position={props.position}
    geometry={geometry}>
    <AnimatedMeshStandardMaterial
      side={THREE.FrontSide}
      opacity={spring.opacity}
      transparent={true}
      depthWrite={false}
      color={"white"} />
    <LineSegments geometry={edgesGeometry}>
      <LineBasicMaterial
        linewidth={1.1}
        color={"white"}
        transparent={true}
        opacity={0.75} />
    </LineSegments>
  </AnimatedMesh>;
};
