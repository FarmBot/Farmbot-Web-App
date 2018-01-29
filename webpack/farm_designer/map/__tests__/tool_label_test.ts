import { textAnchorPosition } from "../tool_label";

describe("textAnchorPosition()", () => {
  const START = { anchor: "start", x: 40, y: 10 };
  const END = { anchor: "end", x: -40, y: 10 };
  const MIDDLE_TOP = { anchor: "middle", x: 0, y: 60 };
  const MIDDLE_BOTTOM = { anchor: "middle", x: 0, y: -40 };

  it("returns correct label position: positive x", () => {
    expect(textAnchorPosition(1, 1)).toEqual(END);
    expect(textAnchorPosition(1, 2)).toEqual(START);
    expect(textAnchorPosition(1, 3)).toEqual(START);
    expect(textAnchorPosition(1, 4)).toEqual(END);
  });

  it("returns correct label position: negative x", () => {
    expect(textAnchorPosition(2, 1)).toEqual(START);
    expect(textAnchorPosition(2, 2)).toEqual(END);
    expect(textAnchorPosition(2, 3)).toEqual(END);
    expect(textAnchorPosition(2, 4)).toEqual(START);
  });

  it("returns correct label position: positive y", () => {
    expect(textAnchorPosition(3, 1)).toEqual(MIDDLE_TOP);
    expect(textAnchorPosition(3, 2)).toEqual(MIDDLE_TOP);
    expect(textAnchorPosition(3, 3)).toEqual(MIDDLE_BOTTOM);
    expect(textAnchorPosition(3, 4)).toEqual(MIDDLE_BOTTOM);
  });

  it("returns correct label position: negative y", () => {
    expect(textAnchorPosition(4, 1)).toEqual(MIDDLE_BOTTOM);
    expect(textAnchorPosition(4, 2)).toEqual(MIDDLE_BOTTOM);
    expect(textAnchorPosition(4, 3)).toEqual(MIDDLE_TOP);
    expect(textAnchorPosition(4, 4)).toEqual(MIDDLE_TOP);
  });
});
