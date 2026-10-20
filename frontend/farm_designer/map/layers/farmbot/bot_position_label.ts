import { isNumber, round } from "lodash";
import { BotPosition } from "../../../../devices/interfaces";
import { MountStage } from "farmbot/dist/resources/api_resources";
import { axisIsMounted } from "../../../../tools/mount_stage";
import { Xyz } from "farmbot";

interface Options {
  mountOffset?: Record<Xyz, number>;
  mountStage?: MountStage;
  rounded?: boolean;
}

export const botPositionLabel = (position: BotPosition, options?: Options) => {
  const show = (n: number | undefined) => {
    if (!isNumber(n)) { return "---"; }
    return options?.rounded ? round(n) : n;
  };
  const mountStage = options?.mountStage ?? MountStage.NONE;
  const showAxis = (axis: Xyz) => {
    if (!axisIsMounted(mountStage, axis)) { return show(position[axis]); }
    const offset = options?.mountOffset?.[axis] ?? 0;
    const label = axis.toUpperCase();
    if (offset === 0) { return label; }
    const sign = offset > 0 ? "+" : "";
    return `${label}${sign}${offset}`;
  };
  return `(${showAxis("x")}, ${showAxis("y")}, ${showAxis("z")})`;
};
