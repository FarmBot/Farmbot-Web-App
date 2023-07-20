import { botPositionLabel } from "../bot_position_label";

describe("botPositionLabel()", () => {
  it("returns full position", () => {
    const position = { x: 1.1, y: 2, z: 3 };
    expect(botPositionLabel(position)).toEqual("(1.1, 2, 3)");
  });

  it("returns rounded position", () => {
    const position = { x: 1.1, y: 2, z: 3 };
    expect(botPositionLabel(position, { rounded: true })).toEqual("(1, 2, 3)");
  });

  it("returns gantry position", () => {
    const position = { x: 1.1, y: 2, z: 3 };
    expect(botPositionLabel(position, { gantryMounted: true }))
      .toEqual("(gantry, 2, 3)");
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
