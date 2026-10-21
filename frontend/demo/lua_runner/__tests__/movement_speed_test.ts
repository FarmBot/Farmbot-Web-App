import {
  getActionMovementSpeed, movementSpeed, normalizeMovementSpeed,
} from "../movement_speed";

describe("movement speed percentages", () => {
  it.each([
    [undefined, 100], [NaN, 100], [Infinity, 100], ["50", 100],
    [0, 1], [-10, 1], [150, 100], [50, 50], [12.5, 12.5],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizeMovementSpeed(input)).toEqual(expected);
  });

  it("preserves omitted speed and converts a fourth argument", () => {
    expect(getActionMovementSpeed({
      type: "move_absolute", args: [1, 2, 3],
    })).toBeUndefined();
    expect(getActionMovementSpeed({
      type: "move_relative", args: [1, 2, 3, 50],
    })).toEqual({ x: 50, y: 50, z: 50 });
    expect(getActionMovementSpeed({
      type: "animated_move_absolute", args: [1, 2, 3, 0],
    })).toEqual({ x: 1, y: 1, z: 1 });
  });

  it("prefers resolved per-axis speed over the fourth argument", () => {
    const speed = { x: 25, y: 50, z: 75 };
    expect(getActionMovementSpeed({
      type: "animated_move_absolute", args: [1, 2, 3, 100], speed,
    })).toEqual(speed);
  });

  it("applies a scalar percentage to all axes", () => {
    expect(movementSpeed(50)).toEqual({ x: 50, y: 50, z: 50 });
    expect(movementSpeed(undefined)).toEqual({ x: 100, y: 100, z: 100 });
  });
});
