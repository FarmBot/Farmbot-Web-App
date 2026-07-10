import { Config } from "../../config";

export const X_TRACK_PADDING = 280;
export const EXTRUSION_WIDTH = 20;
export const UTM_RADIUS = 35;

export const machineOuterY = (config: Config, outerY: number): number =>
  outerY - config.bedYOffset;
