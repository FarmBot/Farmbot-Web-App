import { textAnchorPosition } from "../tool_label";

describe("textAnchorPosition()", () => {
  const START = { anchor: "start", x: 40, y: 10 };
  const END = { anchor: "end", x: -40, y: 10 };
  const MIDDLE_TOP = { anchor: "middle", x: 0, y: 60 };
  const MIDDLE_BOTTOM = { anchor: "middle", x: 0, y: -40 };

  it("returns correct label position: positive x", () => {
    expect(textAnchorPosition(1, 1, false, false)).toEqual(END);
    expect(textAnchorPosition(1, 2, false, false)).toEqual(START);
    expect(textAnchorPosition(1, 3, false, false)).toEqual(START);
    expect(textAnchorPosition(1, 4, false, false)).toEqual(END);
    expect(textAnchorPosition(1, 1, true, false)).toEqual(MIDDLE_TOP);
    expect(textAnchorPosition(1, 2, true, false)).toEqual(MIDDLE_TOP);
    expect(textAnchorPosition(1, 3, true, false)).toEqual(MIDDLE_BOTTOM);
    expect(textAnchorPosition(1, 4, true, false)).toEqual(MIDDLE_BOTTOM);
  });

  it("returns correct label position: negative x", () => {
    expect(textAnchorPosition(2, 1, false, false)).toEqual(START);
    expect(textAnchorPosition(2, 2, false, false)).toEqual(END);
    expect(textAnchorPosition(2, 3, false, false)).toEqual(END);
    expect(textAnchorPosition(2, 4, false, false)).toEqual(START);
    expect(textAnchorPosition(2, 1, true, false)).toEqual(MIDDLE_BOTTOM);
    expect(textAnchorPosition(2, 2, true, false)).toEqual(MIDDLE_BOTTOM);
    expect(textAnchorPosition(2, 3, true, false)).toEqual(MIDDLE_TOP);
    expect(textAnchorPosition(2, 4, true, false)).toEqual(MIDDLE_TOP);
  });

  it("returns correct label position: positive y", () => {
    expect(textAnchorPosition(3, 1, false, false)).toEqual(MIDDLE_TOP);
    expect(textAnchorPosition(3, 2, false, false)).toEqual(MIDDLE_TOP);
    expect(textAnchorPosition(3, 3, false, false)).toEqual(MIDDLE_BOTTOM);
    expect(textAnchorPosition(3, 4, false, false)).toEqual(MIDDLE_BOTTOM);
    expect(textAnchorPosition(3, 1, true, false)).toEqual(END);
    expect(textAnchorPosition(3, 2, true, false)).toEqual(START);
    expect(textAnchorPosition(3, 3, true, false)).toEqual(START);
    expect(textAnchorPosition(3, 4, true, false)).toEqual(END);
  });

  it("returns correct label position: negative y", () => {
    expect(textAnchorPosition(4, 1, false, false)).toEqual(MIDDLE_BOTTOM);
    expect(textAnchorPosition(4, 2, false, false)).toEqual(MIDDLE_BOTTOM);
    expect(textAnchorPosition(4, 3, false, false)).toEqual(MIDDLE_TOP);
    expect(textAnchorPosition(4, 4, false, false)).toEqual(MIDDLE_TOP);
    expect(textAnchorPosition(4, 1, true, false)).toEqual(START);
    expect(textAnchorPosition(4, 2, true, false)).toEqual(END);
    expect(textAnchorPosition(4, 3, true, false)).toEqual(END);
    expect(textAnchorPosition(4, 4, true, false)).toEqual(START);
  });

  it("returns correct label position: no pullout direction", () => {
    expect(textAnchorPosition(0, 1, false, false)).toEqual(END);
    expect(textAnchorPosition(1, 1, false, true)).toEqual(END);
    expect(textAnchorPosition(0, 1, true, false)).toEqual(MIDDLE_TOP);
    expect(textAnchorPosition(1, 1, true, true)).toEqual(MIDDLE_TOP);
    expect(textAnchorPosition(0, 2, false, false)).toEqual(START);
    expect(textAnchorPosition(1, 2, false, true)).toEqual(START);
    expect(textAnchorPosition(0, 2, true, false)).toEqual(MIDDLE_TOP);
    expect(textAnchorPosition(1, 2, true, true)).toEqual(MIDDLE_TOP);
  });

  it("handles bad data", () => {
    expect(textAnchorPosition(1.1, 1.1, false, false)).toEqual(START);
  });
});
