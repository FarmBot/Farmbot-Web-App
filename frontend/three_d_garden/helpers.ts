import { Config } from "./config";
import * as THREE from "three";

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
export const zDir = -1;

export const zero = (config: Config): Record<"x" | "y" | "z", number> => ({
  x: threeSpace(config.bedXOffset, config.bedLengthOuter),
  y: threeSpace(config.bedYOffset, config.bedWidthOuter),
  z: zZero(config),
});

export const extents = (config: Config): Record<"x" | "y" | "z", number> => ({
  x: threeSpace(config.bedXOffset + config.botSizeX, config.bedLengthOuter),
  y: threeSpace(config.bedYOffset + config.botSizeY, config.bedWidthOuter),
  z: zZero(config) + zDir * config.botSizeZ,
});

interface Vector3Array extends Array<number> {
  0: number;
  1: number;
  2: number;
}
export const easyCubicBezierCurve3 = (
  startPosition: Vector3Array,
  startControl: Vector3Array,
  endControl: Vector3Array,
  endPosition: Vector3Array,
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
