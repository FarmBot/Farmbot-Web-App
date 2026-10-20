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
    [MountStage.NONE, "(1.1, 2, 3)"],
    [MountStage.X, "(X+4, 2, 3)"],
    [MountStage.Y, "(X+4, Y-5, 3)"],
    [MountStage.Z, "(X+4, Y-5, Z)"],
  ])("returns stage position: %s", (mountStage, expected) => {
    const position = { x: 1.1, y: 2, z: 3 };
    const mountOffset = { x: 4, y: -5, z: 0 };
    expect(botPositionLabel(position, { mountStage, mountOffset }))
      .toEqual(expected);
  });

  it("returns mounted axes without offsets", () => {
    const position = { x: 1, y: 2, z: 3 };
    expect(botPositionLabel(position, { mountStage: MountStage.Z }))
      .toEqual("(X, Y, Z)");
  });

  it("returns signed offsets for each axis", () => {
    const position = { x: 1, y: 2, z: 3 };
    expect(botPositionLabel(position, {
      mountStage: MountStage.Z,
      mountOffset: { x: -4.5, y: 5.5, z: 6 },
    })).toEqual("(X-4.5, Y+5.5, Z+6)");
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
