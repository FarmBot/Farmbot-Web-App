import { Config } from "./config";
import * as THREE from "three";
import { AxisNumberProperty } from "../farm_designer/map/interfaces";
import { round } from "../farm_designer/map/util";

export const threeSpace = (position: number, max: number): number =>
  position - max / 2;
export const zZero = (config: Config): number =>
  config.columnLength + 40 - config.zGantryOffset;
export const getColorFromBrightness = (value: number) => {
  const colorMap: { [key: number]: string } = {
    1: "#444",
    2: "#555",
    3: "#666",
    4: "#777",
    5: "#888",
    6: "#999",
    7: "#aaa",
    8: "#bbb",
    9: "#ccc",
    10: "#ddd",
    11: "#eee",
    12: "#fff",
  };
  return colorMap[value];
};
export const zDir = (config: Config) => config.negativeZ ? -1 : 1;

export const zero = (config: Config): Record<"x" | "y" | "z", number> => ({
  x: threeSpace(config.bedXOffset, config.bedLengthOuter),
  y: threeSpace(config.bedYOffset, config.bedWidthOuter),
  z: zZero(config),
});

export const extents = (config: Config): Record<"x" | "y" | "z", number> => ({
  x: threeSpace(config.bedXOffset + config.botSizeX, config.bedLengthOuter),
  y: threeSpace(config.bedYOffset + config.botSizeY, config.bedWidthOuter),
  z: zZero(config) - config.botSizeZ,
});

export const easyCubicBezierCurve3 = (
  startPosition: [number, number, number],
  startControl: [number, number, number],
  endControl: [number, number, number],
  endPosition: [number, number, number],
) => {
  const [x1, y1, z1] = startPosition;
  const [x1c, y1c, z1c] = startControl;
  const [x2c, y2c, z2c] = endControl;
  const [x2, y2, z2] = endPosition;
  return new THREE.CubicBezierCurve3(
    new THREE.Vector3(x1, y1, z1),
    new THREE.Vector3(x1 + x1c, y1 + y1c, z1 + z1c),
    new THREE.Vector3(x2 + x2c, y2 + y2c, z2 + z2c),
    new THREE.Vector3(x2, y2, z2),
  );
};

type XY = AxisNumberProperty;

export const getGardenPositionFunc = (config: Config, snap = true) =>
  (threeDPosition: XY): XY => {
    const { bedLengthOuter, bedWidthOuter, bedXOffset, bedYOffset } = config;
    const position = {
      x: threeSpace(threeDPosition.x, -bedLengthOuter) - bedXOffset,
      y: threeSpace(threeDPosition.y, -bedWidthOuter) - bedYOffset,
    };
    return snap
      ? { x: round(position.x), y: round(position.y) }
      : { x: position.x, y: position.y };
  };

export const get3DPositionFunc = (config: Config) =>
  (gardenPosition: XY): XY => {
    const { bedLengthOuter, bedWidthOuter, bedXOffset, bedYOffset } = config;
    return {
      x: threeSpace(gardenPosition.x + bedXOffset, bedLengthOuter),
      y: threeSpace(gardenPosition.y + bedYOffset, bedWidthOuter),
    };
  };
