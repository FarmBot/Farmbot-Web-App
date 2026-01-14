import React from "react";
import * as THREE from "three";
import { Config } from "../../config";
import { Mesh, MeshStandardMaterial } from "../../components";
import { Edges } from "@react-three/drei";
import { zDir } from "../../helpers";
import { ConvexGeometry } from "three-stdlib";
import { cameraMountOffset, cameraMountToLensOffset } from "../bot";

type V3 = [number, number, number];

const lensSize = 2.5;

export interface CameraViewProps {
  config: Config;
  distanceToSoil: number;
  cameraMountPosition: [number, number, number];
}

export const CameraView = (props: CameraViewProps) => {
  const { config, distanceToSoil, cameraMountPosition } = props;
  const cameraLensPosition: [number, number, number] = [
    cameraMountPosition[0] + cameraMountToLensOffset.x,
    cameraMountPosition[1] + cameraMountToLensOffset.y,
    cameraMountPosition[2],
  ];
  const soilZ = distanceToSoil + zDir(config) * config.z;

  const widthAtSoilFromZero = config.imgCenterX * 2 * config.imgScale;
  const heightAtSoilFromZero = config.imgCenterY * 2 * config.imgScale;
  const heightAngle = Math.atan2(heightAtSoilFromZero / 2, soilZ);
  const widthAngle = Math.atan2(widthAtSoilFromZero / 2, soilZ);
  const yEdgeAtSoil = distanceToSoil * Math.tan(heightAngle);
  const xEdgeAtSoil = distanceToSoil * Math.tan(widthAngle);
  const xOffset =
    config.imgOffsetX - cameraMountOffset.x - cameraMountToLensOffset.x;
  const yOffset =
    config.imgOffsetY - cameraMountOffset.y - cameraMountToLensOffset.y;

  const TUL: V3 = [-lensSize, -lensSize, 0];
  const TUR: V3 = [-lensSize, lensSize, 0];
  const TLL: V3 = [lensSize, -lensSize, 0];
  const TLR: V3 = [lensSize, lensSize, 0];
  const BUL: V3 = [-xEdgeAtSoil + xOffset, -yEdgeAtSoil + yOffset, -distanceToSoil];
  const BUR: V3 = [-xEdgeAtSoil + xOffset, yEdgeAtSoil + yOffset, -distanceToSoil];
  const BLL: V3 = [xEdgeAtSoil + xOffset, -yEdgeAtSoil + yOffset, -distanceToSoil];
  const BLR: V3 = [xEdgeAtSoil + xOffset, yEdgeAtSoil + yOffset, -distanceToSoil];

  const VERTICES: V3[] = [
    TUL, TUR, TLL, TLR,
    BUL, BUR, BLL, BLR,
  ];

  return config.cameraView
    ? <Frustum points={VERTICES} position={cameraLensPosition} />
    : <></>;
};

interface FrustumProps {
  points: V3[];
  position: V3;
}

const Frustum = (props: FrustumProps) => {
  const geometry = React.useMemo(() => {
    const pts = props.points.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const g = new ConvexGeometry(pts);
    g.computeVertexNormals();
    g.computeBoundingSphere();
    return g;
  }, [props.points]);

  return <Mesh name={"camera-view"}
    position={props.position}
    geometry={geometry}>
    <MeshStandardMaterial
      side={THREE.FrontSide}
      opacity={0.5}
      transparent={true}
      depthWrite={false}
      color={"white"} />
    <Edges lineWidth={1} color={"white"} opacity={1} />
  </Mesh>;
};
