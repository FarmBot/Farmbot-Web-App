import {
  MountStage, ToolPulloutDirection,
} from "farmbot/dist/resources/api_resources";
import { BotOriginQuadrant } from "../../../../interfaces";
import { textAnchorPosition } from "../tool_label";

describe("textAnchorPosition()", () => {
  const START = { anchor: "start", x: 40, y: 10 };
  const END = { anchor: "end", x: -40, y: 10 };
  const MIDDLE_TOP = { anchor: "middle", x: 0, y: 60 };
  const MIDDLE_BOTTOM = { anchor: "middle", x: 0, y: -40 };
  const stationary = (direction: ToolPulloutDirection,
    quadrant: BotOriginQuadrant, xySwap: boolean) =>
    textAnchorPosition(direction, quadrant, xySwap, MountStage.NONE);
  const mounted = (direction: ToolPulloutDirection,
    quadrant: BotOriginQuadrant, xySwap: boolean) =>
    textAnchorPosition(direction, quadrant, xySwap, MountStage.X);

  it("returns correct label position: positive x", () => {
    expect(stationary(1, 1, false)).toEqual(END);
    expect(stationary(1, 2, false)).toEqual(START);
    expect(stationary(1, 3, false)).toEqual(START);
    expect(stationary(1, 4, false)).toEqual(END);
    expect(stationary(1, 1, true)).toEqual(MIDDLE_TOP);
    expect(stationary(1, 2, true)).toEqual(MIDDLE_TOP);
    expect(stationary(1, 3, true)).toEqual(MIDDLE_BOTTOM);
    expect(stationary(1, 4, true)).toEqual(MIDDLE_BOTTOM);
  });

  it("returns correct label position: negative x", () => {
    expect(stationary(2, 1, false)).toEqual(START);
    expect(stationary(2, 2, false)).toEqual(END);
    expect(stationary(2, 3, false)).toEqual(END);
    expect(stationary(2, 4, false)).toEqual(START);
    expect(stationary(2, 1, true)).toEqual(MIDDLE_BOTTOM);
    expect(stationary(2, 2, true)).toEqual(MIDDLE_BOTTOM);
    expect(stationary(2, 3, true)).toEqual(MIDDLE_TOP);
    expect(stationary(2, 4, true)).toEqual(MIDDLE_TOP);
  });

  it("returns correct label position: positive y", () => {
    expect(stationary(3, 1, false)).toEqual(MIDDLE_TOP);
    expect(stationary(3, 2, false)).toEqual(MIDDLE_TOP);
    expect(stationary(3, 3, false)).toEqual(MIDDLE_BOTTOM);
    expect(stationary(3, 4, false)).toEqual(MIDDLE_BOTTOM);
    expect(stationary(3, 1, true)).toEqual(END);
    expect(stationary(3, 2, true)).toEqual(START);
    expect(stationary(3, 3, true)).toEqual(START);
    expect(stationary(3, 4, true)).toEqual(END);
  });

  it("returns correct label position: negative y", () => {
    expect(stationary(4, 1, false)).toEqual(MIDDLE_BOTTOM);
    expect(stationary(4, 2, false)).toEqual(MIDDLE_BOTTOM);
    expect(stationary(4, 3, false)).toEqual(MIDDLE_TOP);
    expect(stationary(4, 4, false)).toEqual(MIDDLE_TOP);
    expect(stationary(4, 1, true)).toEqual(START);
    expect(stationary(4, 2, true)).toEqual(END);
    expect(stationary(4, 3, true)).toEqual(END);
    expect(stationary(4, 4, true)).toEqual(START);
  });

  it("returns correct label position: no pullout direction", () => {
    expect(stationary(0, 1, false)).toEqual(END);
    expect(mounted(1, 1, false)).toEqual(END);
    expect(stationary(0, 1, true)).toEqual(MIDDLE_TOP);
    expect(mounted(1, 1, true)).toEqual(MIDDLE_TOP);
    expect(stationary(0, 2, false)).toEqual(START);
    expect(mounted(1, 2, false)).toEqual(START);
    expect(stationary(0, 2, true)).toEqual(MIDDLE_TOP);
    expect(mounted(1, 2, true)).toEqual(MIDDLE_TOP);
  });

  it("handles bad data", () => {
    expect(textAnchorPosition(
      1.1 as ToolPulloutDirection,
      1.1 as BotOriginQuadrant,
      false,
      MountStage.NONE,
    )).toEqual(START);
  });
});
