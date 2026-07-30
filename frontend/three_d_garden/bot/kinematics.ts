import { Config, PositionConfig } from "../config";
import { get3DPositionNoMirrorFunc, zDir, zZero } from "../helpers";
import { BotVersion, getBotVersion } from "./bot_versions";

export type Vector3Tuple = [number, number, number];

export interface BotGardenPosition {
  x: number;
  y: number;
}

export interface BotAnchor {
  frame: "gantry" | "cross-slide" | "z-axis";
  localPosition: Vector3Tuple;
  worldPosition: Vector3Tuple;
  gardenPosition: BotGardenPosition;
}

export interface BotKinematics {
  machineOrigin: Vector3Tuple;
  gantryPosition: Vector3Tuple;
  crossSlidePosition: Vector3Tuple;
  zAxisPosition: Vector3Tuple;
  anchors: {
    utm: BotAnchor;
    camera: BotAnchor;
    electronics: BotAnchor;
    wateringNozzle: BotAnchor;
  };
}

const add = (...positions: Vector3Tuple[]): Vector3Tuple => [
  positions.reduce((total, position) => total + position[0], 0),
  positions.reduce((total, position) => total + position[1], 0),
  positions.reduce((total, position) => total + position[2], 0),
];

const anchor = (
  frame: BotAnchor["frame"],
  localPosition: Vector3Tuple,
  worldPosition: Vector3Tuple,
  gardenPosition: BotGardenPosition,
): BotAnchor => ({ frame, localPosition, worldPosition, gardenPosition });

export const getBotKinematics = (
  config: Config,
  position: PositionConfig,
  version: BotVersion = getBotVersion(config.kitVersion),
): BotKinematics => {
  const get3DPosition = get3DPositionNoMirrorFunc(config);
  const origin = get3DPosition({ x: 0, y: 0 });
  const machineOrigin: Vector3Tuple = [origin.x, origin.y, 0];
  const gantryPosition: Vector3Tuple = [position.x, 0, 0];
  const crossSlidePosition: Vector3Tuple = version.number == "v1.9"
    ? [-12.5, position.y + 45, config.columnLength + 97]
    : [-12.5, position.y + 5, config.columnLength + 105];
  const utmZ = zZero(config) - zDir(config) * position.z;
  const zAxisPosition: Vector3Tuple = [
    12.5,
    version.number == "v1.9" ? -45 : -5,
    utmZ - crossSlidePosition[2],
  ];
  const gantryWorld = add(machineOrigin, gantryPosition);
  const crossSlideWorld = add(gantryWorld, crossSlidePosition);
  const zAxisWorld = add(crossSlideWorld, zAxisPosition);

  const cameraLocal: Vector3Tuple = version.cameraFrame == "cross-slide"
    ? [-87.5, -46, -7.5]
    : [12, 35, config.zGantryOffset - 120];
  const cameraWorld = version.cameraFrame == "cross-slide"
    ? add(crossSlideWorld, cameraLocal)
    : add(zAxisWorld, cameraLocal);
  const cameraGarden: BotGardenPosition = version.cameraFrame == "cross-slide"
    ? { x: position.x - 100, y: position.y - 1 }
    : { x: position.x + 12, y: position.y + 35 };

  const electronicsLocal: Vector3Tuple = [
    -73,
    -20 - config.bedYOffset,
    config.columnLength - 190,
  ];
  const nozzleLocal: Vector3Tuple = version.number == "v1.9"
    ? [-87, -13.5, -20]
    : [0, 0, 2.5];
  const nozzleWorld = version.number == "v1.9"
    ? add(crossSlideWorld, nozzleLocal)
    : add(zAxisWorld, nozzleLocal);
  const nozzleGarden: BotGardenPosition = version.number == "v1.9"
    ? { x: position.x - 99.5, y: position.y + 31.5 }
    : { x: position.x, y: position.y };

  return {
    machineOrigin,
    gantryPosition,
    crossSlidePosition,
    zAxisPosition,
    anchors: {
      utm: anchor(
        "z-axis",
        [0, 0, 0],
        zAxisWorld,
        { x: position.x, y: position.y },
      ),
      camera: anchor(
        version.cameraFrame,
        cameraLocal,
        cameraWorld,
        cameraGarden,
      ),
      electronics: anchor(
        "gantry",
        electronicsLocal,
        add(gantryWorld, electronicsLocal),
        { x: position.x - 73, y: -20 - config.bedYOffset },
      ),
      wateringNozzle: anchor(
        version.number == "v1.9" ? "cross-slide" : "z-axis",
        nozzleLocal,
        nozzleWorld,
        nozzleGarden,
      ),
    },
  };
};

export const getCameraDistanceToSoil = (
  config: Config,
  position: PositionConfig,
  getZ: (x: number, y: number) => number,
  kinematics = getBotKinematics(config, position),
): number => {
  const version = getBotVersion(config.kitVersion);
  if (version.cameraFrame == "cross-slide") {
    const camera = kinematics.anchors.camera;
    return camera.worldPosition[2] - zZero(config) -
      getZ(camera.gardenPosition.x, camera.gardenPosition.y);
  }
  return -getZ(position.x - 11, position.y) - zDir(config) * position.z;
};
