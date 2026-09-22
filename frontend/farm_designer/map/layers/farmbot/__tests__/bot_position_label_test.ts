import { botPositionLabel } from "../bot_position_label";
import { MountStage } from "farmbot/dist/resources/api_resources";

describe("botPositionLabel()", () => {
  it("returns full position", () => {
    const position = { x: 1.1, y: 2, z: 3 };
    expect(botPositionLabel(position)).toEqual("(1.1, 2, 3)");
  });

  it("returns rounded position", () => {
    const position = { x: 1.1, y: 2, z: 3 };
    expect(botPositionLabel(position, { rounded: true })).toEqual("(1, 2, 3)");
  });

  it.each<[MountStage, string]>([
    [MountStage.X, "(X axis, 2, 3)"],
    [MountStage.Y, "(Y axis, Y axis, 3)"],
    [MountStage.Z, "(Z axis, Z axis, Z axis)"],
  ])("returns stage position: %s", (mountStage, expected) => {
    const position = { x: 1.1, y: 2, z: 3 };
    expect(botPositionLabel(position, { mountStage })).toEqual(expected);
  });

  it("returns partial position", () => {
    const position = { x: 1, y: 2, z: undefined };
    expect(botPositionLabel(position)).toEqual("(1, 2, ---)");
  });

  it("returns empty position", () => {
    const position = { x: undefined, y: undefined, z: undefined };
    expect(botPositionLabel(position)).toEqual("(---, ---, ---)");
  });
});
