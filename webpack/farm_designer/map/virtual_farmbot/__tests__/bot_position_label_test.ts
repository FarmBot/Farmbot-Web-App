import { botPositionLabel } from "../bot_position_label";

describe("botPositionLabel()", () => {
  it("returns full position", () => {
    const position = { x: 1, y: 2, z: 3 };
    expect(botPositionLabel(position)).toEqual("(1, 2, 3)");
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
