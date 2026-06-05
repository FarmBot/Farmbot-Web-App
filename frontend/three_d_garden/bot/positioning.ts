import * as THREE from "three";
import { Config, PositionConfig } from "../config";
import { get3DPositionNoMirrorFunc } from "../helpers";

export const extrusionWidth = 20;
export const utmRadius = 35;
export const utmHeight = 35;
export const cameraMountOffset = {
  x: extrusionWidth + 3,
  y: utmRadius,
};
export const cameraMountToLensOffset = new THREE.Vector3(
  0,
  extrusionWidth + 9,
  0,
);
export const distinguishableBlack = "#333";

export const getElectronicsBoxPosition = (
  config: Config,
  configPosition: PositionConfig,
) => {
  const { bedYOffset, columnLength } = config;
  const { x } = configPosition;
  const get3DPosition = get3DPositionNoMirrorFunc(config);
  const position = get3DPosition({
    x: x - 62,
    y: -20 - bedYOffset,
  });
  return new THREE.Vector3(
    position.x,
    position.y,
    columnLength - 190,
  );
};
