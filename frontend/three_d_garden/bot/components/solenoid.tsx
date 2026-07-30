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
import { getBotVersion } from "../bot_versions";

type SolenoidPart = GLTF & {
  nodes: { [PartName.solenoid]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}

const SolenoidBody = React.memo((props: {
  position: [number, number, number];
}) => {
  const solenoid = useGLTF(
    ASSETS.models.solenoid,
    LIB_DIR,
  ) as unknown as SolenoidPart;
  return <Mesh name={"solenoid"}
    position={props.position}
    rotation={[0, 0, -Math.PI / 2]}
    scale={1000}
    geometry={solenoid.nodes[PartName.solenoid].geometry}
    material={solenoid.materials.PaletteMaterial001} />;
});

export interface SolenoidProps {
  config: Config;
  configPosition: PositionConfig;
  frame?: "world" | "machine" | "gantry";
  renderBody?: boolean;
  renderTubes?: boolean;
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
  prev.frame === next.frame &&
  prev.renderBody === next.renderBody &&
  prev.renderTubes === next.renderTubes &&
  SOLENOID_CONFIG_FIELDS.every(field =>
    prev.config[field] === next.config[field]);

type Vector3Tuple = [number, number, number];

interface PositionedWaterTubeProps {
  start: Vector3Tuple;
  end: Vector3Tuple;
  startControl: Vector3Tuple;
  endControl: Vector3Tuple;
  tubeName: string;
  tubularSegments: number;
  waterFlow: boolean;
}

const PositionedWaterTube = (props: PositionedWaterTubeProps) => {
  const stableDelta = (end: number, start: number) =>
    Math.round((end - start) * 1_000_000) / 1_000_000;
  const endX = stableDelta(props.end[0], props.start[0]);
  const endY = stableDelta(props.end[1], props.start[1]);
  const endZ = stableDelta(props.end[2], props.start[2]);
  const [startControlX, startControlY, startControlZ] = props.startControl;
  const [endControlX, endControlY, endControlZ] = props.endControl;
  const path = React.useMemo(() => easyCubicBezierCurve3(
    [0, 0, 0],
    [startControlX, startControlY, startControlZ],
    [endControlX, endControlY, endControlZ],
    [endX, endY, endZ],
  ), [
    endControlX,
    endControlY,
    endControlZ,
    endX,
    endY,
    endZ,
    startControlX,
    startControlY,
    startControlZ,
  ]);
  return <Group position={props.start}>
    <WaterTube
      tubeName={props.tubeName}
      waterFlow={props.waterFlow}
      tubePath={path}
      tubularSegments={props.tubularSegments}
      radius={5}
      radialSegments={8} />
  </Group>;
};

const SolenoidBase = (props: SolenoidProps) => {
  const { config } = props;
  const {
    bedLengthOuter, bedWidthOuter, bedXOffset, bedYOffset, columnLength,
    kitVersion, negativeZ, zGantryOffset,
  } = config;
  const version = getBotVersion(kitVersion);
  const { x, y, z } = props.configPosition;
  const zDir = negativeZ ? -1 : 1;
  const get3DPositionNoMirror = (gardenX: number, gardenY: number) => {
    switch (props.frame) {
      case "machine": return { x: gardenX, y: gardenY };
      case "gantry": return { x: gardenX - x, y: gardenY };
      case "world":
      default:
        return {
          x: threeSpace(gardenX + bedXOffset, bedLengthOuter),
          y: threeSpace(gardenY + bedYOffset, bedWidthOuter),
        };
    }
  };
  const outerXY = (gardenX: number, outerY: number): [number, number] => {
    const position = get3DPositionNoMirror(gardenX, outerY - bedYOffset);
    return [position.x, position.y];
  };
  const gardenXY = (gardenX: number, gardenY: number): [number, number] => {
    const position = get3DPositionNoMirror(gardenX, gardenY);
    return [position.x, position.y];
  };
  const lowerStart: Vector3Tuple = [...outerXY(x - 60, -25), -49];
  const lowerEnd: Vector3Tuple = [
    ...outerXY(x - 115.75, 20), columnLength - 217,
  ];
  const solenoidPosition: Vector3Tuple = [
    ...outerXY(x - 115, 20), columnLength - 200,
  ];
  const upperStart: Vector3Tuple = [
    ...outerXY(x - 115.25, 20), columnLength - 98,
  ];
  const upperEnd: Vector3Tuple = [
    ...gardenXY(x - 70, 35), columnLength + 90,
  ];
  const yzStart: Vector3Tuple = [
    ...gardenXY(x - (version.number == "v1.9" ? 60 : 70), y + 80),
    columnLength + 140,
  ];
  const yzEnd: Vector3Tuple = [
    ...gardenXY(
      x - (version.number == "v1.9" ? 83.5 : 43.5),
      y + (version.number == "v1.9" ? 40 : -10),
    ),
    columnLength + (version.number == "v1.9" ? 151 : 180),
  ];
  const utmStart: Vector3Tuple = [
    ...gardenXY(x + 21.5, y - 10),
    columnLength - zDir * z - zGantryOffset + 200,
  ];
  const utmEnd: Vector3Tuple = [
    ...gardenXY(x - 9, y + 15),
    columnLength - zDir * z - zGantryOffset + 75,
  ];
  return <Group>
    {props.renderTubes !== false && <PositionedWaterTube
      start={lowerStart}
      end={lowerEnd}
      startControl={[200, -55, 25]}
      endControl={[5, 10, -250]}
      tubeName={"lower-solenoid-water-tube"}
      waterFlow={config.waterFlow}
      tubularSegments={40} />}
    {props.renderBody !== false &&
      <SolenoidBody position={solenoidPosition} />}
    {props.renderTubes !== false && <PositionedWaterTube
      start={upperStart}
      end={upperEnd}
      startControl={[0, 0, 100]}
      endControl={[0, -75, 5]}
      tubeName={"upper-solenoid-water-tube"}
      waterFlow={config.waterFlow}
      tubularSegments={20} />}
    {props.renderTubes !== false && <PositionedWaterTube
      start={yzStart}
      end={yzEnd}
      startControl={[0, -50, 0]}
      endControl={version.number == "v1.9" ? [20, 20, 0] : [0, 0, -50]}
      tubeName={"y-z-water-tube"}
      waterFlow={config.waterFlow}
      tubularSegments={20} />}
    {props.renderTubes !== false && version.number != "v1.9" &&
    <PositionedWaterTube
      start={utmStart}
      end={utmEnd}
      startControl={[0, 0, -50]}
      endControl={[0, 0, 50]}
      tubeName={"utm-water-tube"}
      waterFlow={config.waterFlow}
      tubularSegments={20} />}
  </Group>;
};

export const Solenoid = React.memo(SolenoidBase, solenoidPropsEqual);
