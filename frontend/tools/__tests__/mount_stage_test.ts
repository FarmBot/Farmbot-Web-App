import { MountStage } from "farmbot/dist/resources/api_resources";
import {
  axisIsMounted, MOUNT_STAGE_CHOICES, mountStageAxes, mountStageLabel,
  resolveMountPosition,
} from "../mount_stage";

describe("mount stage helpers", () => {
  it.each<[MountStage, string[]]>([
    [MountStage.NONE, []],
    [MountStage.X, ["x"]],
    [MountStage.Y, ["x", "y"]],
    [MountStage.Z, ["x", "y", "z"]],
  ])("returns mounted axes for stage %s", (mountStage, axes) => {
    expect(mountStageAxes(mountStage)).toEqual(axes);
  });

  it("checks mounted axes", () => {
    expect(axisIsMounted(MountStage.Y, "x")).toBeTruthy();
    expect(axisIsMounted(MountStage.Y, "y")).toBeTruthy();
    expect(axisIsMounted(MountStage.Y, "z")).toBeFalsy();
  });

  it.each<[MountStage, string]>([
    [MountStage.NONE, "Stationary"],
    [MountStage.X, "X axis"],
    [MountStage.Y, "Y axis"],
    [MountStage.Z, "Z axis"],
  ])("returns the label for stage %s", (mountStage, label) => {
    expect(mountStageLabel(mountStage)).toEqual(label);
  });

  it("returns dropdown choices", () => {
    expect(MOUNT_STAGE_CHOICES()).toEqual([
      { label: "Stationary", value: MountStage.NONE },
      { label: "X axis", value: MountStage.X },
      { label: "Y axis", value: MountStage.Y },
      { label: "Z axis", value: MountStage.Z },
    ]);
  });

  it.each<[MountStage, { x: number, y: number, z: number }]>([
    [MountStage.NONE, { x: 1, y: 2, z: 3 }],
    [MountStage.X, { x: 10, y: 2, z: 3 }],
    [MountStage.Y, { x: 10, y: 20, z: 3 }],
    [MountStage.Z, { x: 10, y: 20, z: 30 }],
  ])("resolves position for stage %s", (mountStage, expected) => {
    expect(resolveMountPosition(
      { x: 1, y: 2, z: 3 },
      { x: 10, y: 20, z: 30 },
      mountStage,
    )).toEqual(expected);
  });

  it("falls back to stored coordinates", () => {
    expect(resolveMountPosition(
      { x: 1, y: 2, z: 3 },
      { x: undefined, y: undefined, z: undefined },
      MountStage.Z,
    )).toEqual({ x: 1, y: 2, z: 3 });
  });

  it.each<[MountStage, { x: number, y: number, z: number }]>([
    [MountStage.NONE, { x: 1, y: 2, z: 3 }],
    [MountStage.X, { x: 14, y: 2, z: 3 }],
    [MountStage.Y, { x: 14, y: 15, z: 3 }],
    [MountStage.Z, { x: 14, y: 15, z: 36 }],
  ])("applies offsets for stage %s", (mountStage, expected) => {
    expect(resolveMountPosition(
      {
        x: 1, y: 2, z: 3,
        mount_offset_x: 4,
        mount_offset_y: -5,
        mount_offset_z: 6,
      },
      { x: 10, y: 20, z: 30 },
      mountStage,
    )).toEqual(expected);
  });

  it("does not apply offsets to stored-coordinate fallbacks", () => {
    expect(resolveMountPosition(
      {
        x: 1, y: 2, z: 3,
        mount_offset_x: 4,
        mount_offset_y: 5,
        mount_offset_z: 6,
      },
      { x: undefined, y: 20, z: undefined },
      MountStage.Z,
    )).toEqual({ x: 1, y: 25, z: 3 });
  });
});
