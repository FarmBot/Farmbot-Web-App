import React from "react";
import * as THREE from "three";
import { Config, PositionConfig } from "../../config";
import { Mesh, MeshStandardMaterial } from "../../components";
import { Edges } from "@react-three/drei";
import { zDir } from "../../helpers";
import { ConvexGeometry } from "three-stdlib";
import { cameraMountOffset, cameraMountToLensOffset } from "../bot";
import { extraRotation } from "../../garden/images";
import { useSpring, animated } from "@react-spring/three";

const AnimatedMesh = animated(Mesh);
const AnimatedMeshStandardMaterial = animated(MeshStandardMaterial);

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

export const getCameraViewPoints = (props: CameraViewProps) => {
  const { config, distanceToSoil, cameraMountPosition } = props;
  const cameraLensPosition = cameraMountPosition.clone()
    .add(cameraMountToLensOffset);
  const soilZ = distanceToSoil + zDir(config) * props.configPosition.z;

  const widthAtSoilFromZero = config.imgCenterX * 2 * config.imgScale;
  const heightAtSoilFromZero = config.imgCenterY * 2 * config.imgScale;
  const heightAngle = Math.atan2(heightAtSoilFromZero / 2, soilZ);
  const widthAngle = Math.atan2(widthAtSoilFromZero / 2, soilZ);
  const yEdgeAtSoil = distanceToSoil * Math.tan(heightAngle);
  const xEdgeAtSoil = distanceToSoil * Math.tan(widthAngle);

  const topCenter = toV([0, 0, 0]);

  const xCenter = -cameraMountOffset.x - cameraMountToLensOffset.x;
  const yCenter = -cameraMountOffset.y - cameraMountToLensOffset.y;
  const bottomCenter = toV([xCenter, yCenter, 0]);

  const offset = toV([config.imgOffsetX, config.imgOffsetY, 0]);

  const rotation = config.imgRotation + extraRotation(config);
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

export const CameraView = (props: CameraViewProps) => {
  const { config } = props;
  const { cameraLensPosition, points } = getCameraViewPoints(props);
  return config.cameraView
    ? <Frustum points={points} position={cameraLensPosition} config={config} />
    : <></>;
};

interface FrustumProps {
  points: THREE.Vector3[];
  position: THREE.Vector3;
  config: Config;
}

const Frustum = (props: FrustumProps) => {
  const geometry = React.useMemo(() => {
    const g = new ConvexGeometry(props.points);
    g.computeVertexNormals();
    g.computeBoundingSphere();
    return g;
  }, [props.points]);

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
    <Edges
      lineWidth={1.1}
      color={"white"}
      transparent={true}
      opacity={0.75}
      threshold={1} />
  </AnimatedMesh>;
};
