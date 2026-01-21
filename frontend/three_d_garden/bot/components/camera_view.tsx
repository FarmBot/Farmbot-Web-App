import React from "react";
import * as THREE from "three";
import { Config } from "../../config";
import { Mesh, MeshStandardMaterial } from "../../components";
import { Edges } from "@react-three/drei";
import { zDir } from "../../helpers";
import { ConvexGeometry } from "three-stdlib";
import { cameraMountOffset, cameraMountToLensOffset } from "../bot";
import { extraRotation } from "../../garden/images";

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
  distanceToSoil: number;
  cameraMountPosition: THREE.Vector3;
}

export const CameraView = React.memo((props: CameraViewProps) => {
  const { config, distanceToSoil, cameraMountPosition } = props;
  if (!config.cameraView) { return <></>; }
  const zDirection = React.useMemo(
    () => zDir(config),
    [config.negativeZ],
  );
  const cameraLensPosition = React.useMemo(() =>
    cameraMountPosition.clone().add(cameraMountToLensOffset), [
    cameraMountPosition,
  ]);
  const soilZ = React.useMemo(
    () => distanceToSoil + zDirection * config.z,
    [distanceToSoil, zDirection, config.z],
  );
  const widthAtSoilFromZero = React.useMemo(
    () => config.imgCenterX * 2 * config.imgScale,
    [config.imgCenterX, config.imgScale],
  );
  const heightAtSoilFromZero = React.useMemo(
    () => config.imgCenterY * 2 * config.imgScale,
    [config.imgCenterY, config.imgScale],
  );
  const yEdgeAtSoil = React.useMemo(() => {
    const heightAngle = Math.atan2(heightAtSoilFromZero / 2, soilZ);
    return distanceToSoil * Math.tan(heightAngle);
  }, [heightAtSoilFromZero, soilZ, distanceToSoil]);
  const xEdgeAtSoil = React.useMemo(() => {
    const widthAngle = Math.atan2(widthAtSoilFromZero / 2, soilZ);
    return distanceToSoil * Math.tan(widthAngle);
  }, [widthAtSoilFromZero, soilZ, distanceToSoil]);
  const xCenter = React.useMemo(
    () => -cameraMountOffset.x - cameraMountToLensOffset.x,
    [],
  );
  const yCenter = React.useMemo(
    () => -cameraMountOffset.y - cameraMountToLensOffset.y,
    [],
  );
  const rotation = React.useMemo(
    () => config.imgRotation + extraRotation(config),
    [config.imgRotation, config.imgOrigin],
  );
  const offset = React.useMemo(() =>
    toV([config.imgOffsetX, config.imgOffsetY, 0]), [
    config.imgOffsetX,
    config.imgOffsetY,
  ]);
  const vertices = React.useMemo(() => {
    const topCenter = toV([0, 0, 0]);
    const bottomCenter = toV([xCenter, yCenter, 0]);
    const rotateTop = (point: V3) => rotatePoint(point, rotation, topCenter);
    const rotateBottom = (point: V3) =>
      rotatePoint(point, rotation, bottomCenter).add(offset);
    const topPoints: V3[] = [
      [-lensSize, -lensSize, 0],
      [-lensSize, lensSize, 0],
      [lensSize, -lensSize, 0],
      [lensSize, lensSize, 0],
    ];
    const bottomPoints: V3[] = [
      [xCenter - xEdgeAtSoil, yCenter - yEdgeAtSoil, -distanceToSoil],
      [xCenter - xEdgeAtSoil, yCenter + yEdgeAtSoil, -distanceToSoil],
      [xCenter + xEdgeAtSoil, yCenter - yEdgeAtSoil, -distanceToSoil],
      [xCenter + xEdgeAtSoil, yCenter + yEdgeAtSoil, -distanceToSoil],
    ];
    const top = topPoints.map(rotateTop);
    const bottom = bottomPoints.map(rotateBottom);
    return [...top, ...bottom];
  }, [
    xCenter,
    yCenter,
    xEdgeAtSoil,
    yEdgeAtSoil,
    distanceToSoil,
    rotation,
    offset,
  ]);

  return <Frustum points={vertices} position={cameraLensPosition} />;
});

interface FrustumProps {
  points: THREE.Vector3[];
  position: THREE.Vector3;
}

const Frustum = (props: FrustumProps) => {
  const geometry = React.useMemo(() => {
    const g = new ConvexGeometry(props.points);
    g.computeVertexNormals();
    g.computeBoundingSphere();
    return g;
  }, [props.points]);

  return <Mesh name={"camera-view"}
    position={props.position}
    geometry={geometry}>
    <MeshStandardMaterial
      side={THREE.FrontSide}
      opacity={0.25}
      transparent={true}
      depthWrite={false}
      color={"white"} />
    <Edges lineWidth={1.1}
      color={"white"}
      opacity={0.75}
      transparent={true}
      threshold={1} />
  </Mesh>;
};
