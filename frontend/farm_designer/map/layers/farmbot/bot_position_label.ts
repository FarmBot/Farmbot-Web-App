import { isNumber, round } from "lodash";
import { BotPosition } from "../../../../devices/interfaces";
import { MountStage } from "farmbot/dist/resources/api_resources";
import { axisIsMounted, mountStageLabel } from "../../../../tools/mount_stage";

interface Options {
  mountStage?: MountStage;
  rounded?: boolean;
}

export const botPositionLabel = (position: BotPosition, options?: Options) => {
  const show = (n: number | undefined) => {
    if (!isNumber(n)) { return "---"; }
    return options?.rounded ? round(n) : n;
  };
  const mountStage = options?.mountStage ?? MountStage.NONE;
  const showAxis = (axis: "x" | "y" | "z") =>
    axisIsMounted(mountStage, axis)
      ? mountStageLabel(mountStage)
      : show(position[axis]);
  return `(${showAxis("x")}, ${showAxis("y")}, ${showAxis("z")})`;
};
