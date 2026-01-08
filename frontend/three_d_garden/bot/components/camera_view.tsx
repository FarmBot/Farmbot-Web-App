import React from "react";
import * as THREE from "three";
import { Config } from "../../config";
import { Group, MeshStandardMaterial } from "../../components";
import { Cylinder, Line } from "@react-three/drei";
import { zDir, zZero as zZeroFunc } from "../../helpers";

export interface CameraViewProps {
  config: Config;
  distanceToSoil: number;
  cameraLensPosition: [number, number, number];
}

const lensSize = 5;
const viewHeight = 2000;

export const CameraView = (props: CameraViewProps) => {
  const { config, distanceToSoil, cameraLensPosition } = props;
  const soilZ = distanceToSoil + zDir(config) * config.z;

  const aspect = config.imgCenterX / config.imgCenterY;
  const widthAtSoilFromZero = config.imgCenterX * 2 * config.imgScale;
  const heightAtSoilFromZero = config.imgCenterY * 2 * config.imgScale;
  const heightAngle = Math.atan2(heightAtSoilFromZero / 2, soilZ);
  const widthAngle = Math.atan2(widthAtSoilFromZero / 2, soilZ);
  const heightAtViewHeight = 2 * 0.94 * viewHeight * Math.tan(heightAngle);
  const halfHeightAtSoil = distanceToSoil * Math.tan(heightAngle);
  const halfWidthAtSoil = distanceToSoil * Math.tan(widthAngle);

  const zZero = zZeroFunc(config);
  const cameraViewClippingPlane =
    new THREE.Plane(new THREE.Vector3(0, 0, 1), soilZ - zZero);

  type V3 = [number, number, number];
  const TUL: V3 = [-lensSize, -lensSize, 0];
  const TUR: V3 = [-lensSize, lensSize, 0];
  const TLL: V3 = [lensSize, -lensSize, 0];
  const TLR: V3 = [lensSize, lensSize, 0];
  const BUL: V3 = [-halfWidthAtSoil, -halfHeightAtSoil, -distanceToSoil];
  const BUR: V3 = [-halfWidthAtSoil, halfHeightAtSoil, -distanceToSoil];
  const BLL: V3 = [halfWidthAtSoil, -halfHeightAtSoil, -distanceToSoil];
  const BLR: V3 = [halfWidthAtSoil, halfHeightAtSoil, -distanceToSoil];

  const POINTS: V3[] = [
    TUL, TUR, TLR, TLL, TUL,
    BUL,
    BLL, TLL, BLL,
    BLR, TLR, BLR,
    BUR, TUR, BUR,
    BUL,
  ];

  return config.cameraView
    ? <Group name={"camera-view"}
      position={[
        cameraLensPosition[0],
        cameraLensPosition[1],
        cameraLensPosition[2] - viewHeight / 2,
      ]}>
      <Group scale={[1, 1 / aspect, 1]}>
        <Cylinder
          args={[heightAtViewHeight, lensSize, viewHeight, 4]}
          rotation={[-Math.PI / 2, -Math.PI / 4, 0]}>
          <MeshStandardMaterial
            opacity={0.3}
            transparent={true}
            depthWrite={false}
            clippingPlanes={[cameraViewClippingPlane]}
            color={"white"} />
        </Cylinder>
      </Group>
      <Line
        position={[0, 0, viewHeight / 2]}
        points={POINTS}
        linewidth={1}
        color={"white"} />
    </Group>
    : <></>;
};
