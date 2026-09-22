import { Xyz } from "farmbot";
import { SlotWithTool } from "../../../resources/interfaces";
import { Config, PositionConfig } from "../../config";
import {
  get3DPositionFunc, get3DPositionNoMirrorFunc,
  zDir as zDirFunc, zZero as zZeroFunc,
} from "../../helpers";
import { MountStage } from "farmbot/dist/resources/api_resources";
import { resolveMountPosition } from "../../../tools/mount_stage";

export interface ThreeDToolPositionInput {
  x: number;
  y: number;
  z: number;
  mountStage: MountStage;
}

export interface ToolPositionHelpers {
  get3DPosition: ReturnType<typeof get3DPositionFunc>;
  get3DPositionNoMirror: ReturnType<typeof get3DPositionNoMirrorFunc>;
  zZero: number;
  zDir: number;
}

export const getToolPositionHelpers = (
  config: Config,
): ToolPositionHelpers => ({
  get3DPosition: get3DPositionFunc(config),
  get3DPositionNoMirror: get3DPositionNoMirrorFunc(config),
  zZero: zZeroFunc(config),
  zDir: zDirFunc(config),
});

export const getToolRenderPosition = (
  config: Config,
  tool: ThreeDToolPositionInput,
  inToolbay: boolean,
  helpers = getToolPositionHelpers(config),
): Record<Xyz, number> => {
  const mirroredPosition = helpers.get3DPosition({ x: tool.x, y: tool.y });
  const noMirrorPosition =
    helpers.get3DPositionNoMirror({ x: tool.x, y: tool.y });
  return {
    x: inToolbay ? mirroredPosition.x : noMirrorPosition.x,
    y: inToolbay && tool.mountStage == MountStage.NONE
      ? mirroredPosition.y
      : noMirrorPosition.y,
    z: helpers.zZero
      - helpers.zDir * tool.z
      + (inToolbay ? 0 : (35 / 2 - 15)),
  };
};

export const getToolSlotRenderPosition = (
  config: Config,
  configPosition: PositionConfig,
  slot: SlotWithTool,
): Record<Xyz, number> => {
  const slotBody = slot.toolSlot.body;
  const mirroredBotX = config.mirrorX
    ? config.botSizeX - configPosition.x
    : configPosition.x;
  const slotPosition = resolveMountPosition(slotBody, {
    x: mirroredBotX,
    y: configPosition.y,
    z: configPosition.z,
  }, slotBody.mount_stage);
  const position = getToolRenderPosition(config, {
    x: slotPosition.x,
    y: slotBody.mount_stage == MountStage.X
      ? slotPosition.y - config.bedYOffset
      : slotPosition.y,
    z: slotPosition.z,
    mountStage: slotBody.mount_stage,
  }, true);
  return {
    x: position.x,
    y: position.y,
    z: position.z - 9,
  };
};
