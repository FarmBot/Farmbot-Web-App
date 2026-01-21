import React from "react";
import * as THREE from "three";
import { Config } from "../../config";
import { Group, Mesh } from "../../components";
import { WaterTube } from "./water_tube";
import { easyCubicBezierCurve3, threeSpace, zDir as zDirFunc } from "../../helpers";
import { GLTF } from "three-stdlib";
import { useGLTF } from "@react-three/drei";
import { ASSETS, LIB_DIR, PartName } from "../../constants";

type SolenoidPart = GLTF & {
  nodes: { [PartName.solenoid]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}

export interface SolenoidProps {
  config: Config;
}

export const Solenoid = React.memo((props: SolenoidProps) => {
  const { config } = props;
  const {
    x, y, z, bedLengthOuter, bedWidthOuter, bedXOffset, bedYOffset,
    columnLength, zGantryOffset,
  } = config;
  const zDir = React.useMemo(() => zDirFunc(config), [config]);
  const toX = React.useCallback((xValue: number) =>
    threeSpace(xValue, bedLengthOuter) + bedXOffset,
  [bedLengthOuter, bedXOffset]);
  const toY = React.useCallback((yValue: number) =>
    threeSpace(yValue, bedWidthOuter) + bedYOffset,
  [bedWidthOuter, bedYOffset]);
  const solenoid = useGLTF(ASSETS.models.solenoid, LIB_DIR) as SolenoidPart;
  const lowerTubePath = React.useMemo(() => easyCubicBezierCurve3(
    [
      toX(x - 45),
      threeSpace(-25, bedWidthOuter),
      -49,
    ],
    [200, -55, 25],
    [5, 10, -250],
    [
      toX(x - 104.75),
      threeSpace(20, bedWidthOuter),
      columnLength - 217,
    ],
  ), [bedWidthOuter, columnLength, toX, x]);
  const solenoidPosition = React.useMemo<[number, number, number]>(() => ([
    toX(x - 104),
    threeSpace(20, bedWidthOuter),
    columnLength - 200,
  ]), [bedWidthOuter, columnLength, toX, x]);
  const upperTubePath = React.useMemo(() => easyCubicBezierCurve3(
    [
      toX(x - 104.25),
      threeSpace(20, bedWidthOuter),
      columnLength - 98,
    ],
    [0, 0, 100],
    [0, -75, 5],
    [
      toX(x - 70),
      toY(35),
      columnLength + 90,
    ],
  ), [bedWidthOuter, columnLength, toX, toY, x]);
  const yzTubePath = React.useMemo(() => easyCubicBezierCurve3(
    [
      toX(x - 70),
      toY(y + 80),
      columnLength + 140,
    ],
    [0, -50, 0],
    [0, 0, -50],
    [
      toX(x - 32.5),
      toY(y - 10),
      columnLength + 180,
    ],
  ), [columnLength, toX, toY, x, y]);
  const utmTubePath = React.useMemo(() => easyCubicBezierCurve3(
    [
      toX(x + 32.5),
      toY(y - 10),
      columnLength - zDir * z - zGantryOffset + 200,
    ],
    [0, 0, -50],
    [0, 0, 50],
    [
      toX(x + 2),
      toY(y + 15),
      columnLength - zDir * z - zGantryOffset + 75,
    ],
  ), [columnLength, toX, toY, x, y, z, zDir, zGantryOffset]);
  return <Group>
    <WaterTube tubeName={"lower-solenoid-water-tube"}
      waterFlow={config.waterFlow}
      tubePath={lowerTubePath}
      tubularSegments={40}
      radius={5}
      radialSegments={8} />
    <Mesh name={"solenoid"}
      position={solenoidPosition}
      rotation={[0, 0, -Math.PI / 2]}
      scale={1000}
      geometry={solenoid.nodes[PartName.solenoid].geometry}
      material={solenoid.materials.PaletteMaterial001} />
    <WaterTube tubeName={"upper-solenoid-water-tube"}
      waterFlow={config.waterFlow}
      tubePath={upperTubePath}
      tubularSegments={20}
      radius={5}
      radialSegments={8} />
    <WaterTube tubeName={"y-z-water-tube"}
      waterFlow={config.waterFlow}
      tubePath={yzTubePath}
      tubularSegments={20}
      radius={5}
      radialSegments={8} />
    <WaterTube tubeName={"utm-water-tube"}
      waterFlow={config.waterFlow}
      tubePath={utmTubePath}
      tubularSegments={20}
      radius={5}
      radialSegments={8} />
  </Group>;
});
