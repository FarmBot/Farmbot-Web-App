import React from "react";
import * as THREE from "three";
import { Config, PositionConfig } from "../../config";
import { Group, Mesh } from "../../components";
import { WaterTube } from "./water_tube";
import {
  easyCubicBezierCurve3, threeSpace,
} from "../../helpers";
import type { GLTF } from "three-stdlib";
import { useGLTF } from "@react-three/drei";
import { ASSETS, LIB_DIR, PartName } from "../../constants";

type SolenoidPart = GLTF & {
  nodes: { [PartName.solenoid]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}

export interface SolenoidProps {
  config: Config;
  configPosition: PositionConfig;
}

export const Solenoid = (props: SolenoidProps) => {
  const { config } = props;
  const {
    bedLengthOuter, bedWidthOuter, bedXOffset, bedYOffset, columnLength,
    negativeZ, zGantryOffset,
  } = config;
  const { x, y, z } = props.configPosition;
  const {
    lowerTubePath,
    solenoidPosition,
    upperTubePath,
    yzTubePath,
    utmTubePath,
  } = React.useMemo(() => {
    const zDir = negativeZ ? -1 : 1;
    const get3DPositionNoMirror = (gardenX: number, gardenY: number) => ({
      x: threeSpace(gardenX + bedXOffset, bedLengthOuter),
      y: threeSpace(gardenY + bedYOffset, bedWidthOuter),
    });
    const outerXY = (gardenX: number, outerY: number): [number, number] => {
      const position = get3DPositionNoMirror(gardenX, outerY - bedYOffset);
      return [position.x, position.y];
    };
    const gardenXY = (gardenX: number, gardenY: number): [number, number] => {
      const position = get3DPositionNoMirror(gardenX, gardenY);
      return [position.x, position.y];
    };
    return {
      lowerTubePath: easyCubicBezierCurve3(
        [
          ...outerXY(x - 45, -25),
          -49,
        ],
        [200, -55, 25],
        [5, 10, -250],
        [
          ...outerXY(x - 104.75, 20),
          columnLength - 217,
        ],
      ),
      solenoidPosition: [
        ...outerXY(x - 104, 20),
        columnLength - 200,
      ] as [number, number, number],
      upperTubePath: easyCubicBezierCurve3(
        [
          ...outerXY(x - 104.25, 20),
          columnLength - 98,
        ],
        [0, 0, 100],
        [0, -75, 5],
        [
          ...gardenXY(x - 70, 35),
          columnLength + 90,
        ],
      ),
      yzTubePath: easyCubicBezierCurve3(
        [
          ...gardenXY(x - 70, y + 80),
          columnLength + 140,
        ],
        [0, -50, 0],
        [0, 0, -50],
        [
          ...gardenXY(x - 32.5, y - 10),
          columnLength + 180,
        ],
      ),
      utmTubePath: easyCubicBezierCurve3(
        [
          ...gardenXY(x + 32.5, y - 10),
          columnLength - zDir * z - zGantryOffset + 200,
        ],
        [0, 0, -50],
        [0, 0, 50],
        [
          ...gardenXY(x + 2, y + 15),
          columnLength - zDir * z - zGantryOffset + 75,
        ],
      ),
    };
  }, [
    bedLengthOuter,
    bedWidthOuter,
    bedXOffset,
    bedYOffset,
    columnLength,
    negativeZ,
    x,
    y,
    z,
    zGantryOffset,
  ]);
  const solenoid = useGLTF(ASSETS.models.solenoid, LIB_DIR) as unknown as SolenoidPart;
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
};
