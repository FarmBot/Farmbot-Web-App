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

const SOLENOID_CONFIG_FIELDS: (keyof Config)[] = [
  "bedLengthOuter",
  "bedWidthOuter",
  "bedXOffset",
  "bedYOffset",
  "columnLength",
  "kitVersion",
  "negativeZ",
  "waterFlow",
  "zGantryOffset",
];

export const solenoidPropsEqual = (
  prev: SolenoidProps,
  next: SolenoidProps,
) =>
  prev.configPosition.x === next.configPosition.x &&
  prev.configPosition.y === next.configPosition.y &&
  prev.configPosition.z === next.configPosition.z &&
  SOLENOID_CONFIG_FIELDS.every(field =>
    prev.config[field] === next.config[field]);

const SolenoidBase = (props: SolenoidProps) => {
  const { config } = props;
  const {
    bedLengthOuter, bedWidthOuter, bedXOffset, bedYOffset, columnLength,
    kitVersion, negativeZ, zGantryOffset,
  } = config;
  const isV19 = kitVersion == "v1.9";
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
          ...outerXY(x - 60, -25),
          -49,
        ],
        [200, -55, 25],
        [5, 10, -250],
        [
          ...outerXY(x - 115.75, 20),
          columnLength - 217,
        ],
      ),
      solenoidPosition: [
        ...outerXY(x - 115, 20),
        columnLength - 200,
      ] as [number, number, number],
      upperTubePath: easyCubicBezierCurve3(
        [
          ...outerXY(x - 115.25, 20),
          columnLength - 98,
        ],
        [0, 0, 100],
        [0, -75, 5],
        [
          ...gardenXY(x - 70, 35),
          columnLength + 90,
        ],
      ),
      yzTubePath: kitVersion == "v1.9"
        ? easyCubicBezierCurve3(
          [
            ...gardenXY(x - 60, y + 80),
            columnLength + 140,
          ],
          [0, -50, 0],
          [20, 20, 0],
          [
            ...gardenXY(x - 83.5, y + 40),
            columnLength + 151,
          ],
        )
        : easyCubicBezierCurve3(
          [
            ...gardenXY(x - 70, y + 80),
            columnLength + 140,
          ],
          [0, -50, 0],
          [0, 0, -50],
          [
            ...gardenXY(x - 43.5, y - 10),
            columnLength + 180,
          ],
        ),
      utmTubePath: easyCubicBezierCurve3(
        [
          ...gardenXY(x + 21.5, y - 10),
          columnLength - zDir * z - zGantryOffset + 200,
        ],
        [0, 0, -50],
        [0, 0, 50],
        [
          ...gardenXY(x - 9, y + 15),
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
    kitVersion,
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
    {!isV19 && <WaterTube tubeName={"utm-water-tube"}
      waterFlow={config.waterFlow}
      tubePath={utmTubePath}
      tubularSegments={20}
      radius={5}
      radialSegments={8} />}
  </Group>;
};

export const Solenoid = React.memo(SolenoidBase, solenoidPropsEqual);
