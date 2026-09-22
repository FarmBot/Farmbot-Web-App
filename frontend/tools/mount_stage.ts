import { Xyz } from "farmbot";
import { MountStage } from "farmbot/dist/resources/api_resources";
import { BotPosition } from "../devices/interfaces";
import { t } from "../i18next_wrapper";
import type { DropDownItem } from "../ui";

export type MountPosition = Record<Xyz, number> & {
  mount_offset_x?: number;
  mount_offset_y?: number;
  mount_offset_z?: number;
};

const MOUNT_STAGE_AXES: Record<MountStage, Xyz[]> = {
  [MountStage.NONE]: [],
  [MountStage.X]: ["x"],
  [MountStage.Y]: ["x", "y"],
  [MountStage.Z]: ["x", "y", "z"],
};

export const mountStageAxes = (mountStage: MountStage): Xyz[] =>
  MOUNT_STAGE_AXES[mountStage];

export const axisIsMounted = (mountStage: MountStage, axis: Xyz): boolean =>
  mountStageAxes(mountStage).includes(axis);

export const mountStageLabel = (mountStage: MountStage): string => {
  switch (mountStage) {
    case MountStage.X: return t("X axis");
    case MountStage.Y: return t("Y axis");
    case MountStage.Z: return t("Z axis");
    case MountStage.NONE: return t("Stationary");
    default: return t("Stationary");
  }
};

export const MOUNT_STAGE_CHOICES = (): DropDownItem[] => [
  MountStage.NONE,
  MountStage.X,
  MountStage.Y,
  MountStage.Z,
].map(mountStage => ({
  label: mountStageLabel(mountStage),
  value: mountStage,
}));

const mountOffset = (position: MountPosition, axis: Xyz): number =>
  position[`mount_offset_${axis}`] ?? 0;

const resolveMountAxis = (
  slotPosition: MountPosition,
  botPosition: BotPosition,
  mountStage: MountStage,
  axis: Xyz,
): number => {
  if (!axisIsMounted(mountStage, axis)) { return slotPosition[axis]; }
  const botCoordinate = botPosition[axis];
  return botCoordinate == undefined
    ? slotPosition[axis]
    : botCoordinate + mountOffset(slotPosition, axis);
};

export const resolveMountPosition = (
  slotPosition: MountPosition,
  botPosition: BotPosition,
  mountStage: MountStage,
): Record<Xyz, number> => ({
  x: resolveMountAxis(slotPosition, botPosition, mountStage, "x"),
  y: resolveMountAxis(slotPosition, botPosition, mountStage, "y"),
  z: resolveMountAxis(slotPosition, botPosition, mountStage, "z"),
});
