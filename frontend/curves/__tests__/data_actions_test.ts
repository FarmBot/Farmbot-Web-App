import {
  maxDay,
  maxValue,
  curveSum,
  inData,
  addOrRemoveItem,
  populatedData,
  interpolateDay,
  scaleData,
} from "../data_actions";

describe("maxDay()", () => {
  it("returns day", () => {
    expect(maxDay({ 1: 1, 100: 100 })).toEqual(100);
    expect(maxDay({})).toEqual(1);
  });
});

describe("maxValue()", () => {
  it("returns value", () => {
    expect(maxValue({ 1: 1, 100: 100 })).toEqual(100);
    expect(maxValue({})).toEqual(0);
  });
});

describe("curveSum()", () => {
  it("returns sum", () => {
    expect(curveSum({ 1: 1, 2: 2, 3: 3, 4: 40 }, 3)).toEqual(0.01);
    expect(curveSum({ 1: 1, 2: 2, 3: 3, 4: 40 })).toEqual(0.05);
  });
});

describe("inData()", () => {
  it("returns result", () => {
    expect(inData({ 1: 1, 2: 2 }, 1)).toEqual(true);
    expect(inData({ 1: 1, 2: 2 }, 3)).toEqual(false);
  });
});

describe("addOrRemoveItem()", () => {
  it("removes item", () => {
    expect(addOrRemoveItem({ 1: 1, 2: 2 }, 2, 0)).toEqual({ 1: 1 });
  });

  it("adds item", () => {
    expect(addOrRemoveItem({ 1: 1, 2: 2 }, 3, 3))
      .toEqual({ 1: 1, 2: 2, 3: 3 });
  });

  it("doesn't add item", () => {
    expect(addOrRemoveItem({
      1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10,
    }, 11, 11))
      .toEqual({
        1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10,
      });
  });
});

describe("populatedData()", () => {
  it("returns full data", () => {
    expect(populatedData({ 1: 1, 5: 5 }))
      .toEqual({ 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 });
  });

  it("handles empty data", () => {
    expect(populatedData({})).toEqual({ 1: 0 });
  });
});

describe("interpolateDay()", () => {
  it.each<[number, number]>([
    [4, 4],
    [0, 1],
    [6, 5],
    [11, 1],
    [3, 3],
    [1, 1],
  ])("returns value: %s", (day, expected) => {
    expect(interpolateDay({ 1: 1, 5: 5, 7: 5, 10: 1 }, day, false))
      .toEqual(expected);
  });

  it("returns rounded value", () => {
    expect(interpolateDay({ 1: 1, 5: 10, 7: 10, 10: 1 }, 3, false)).toEqual(6);
  });

  it("returns exact value", () => {
    expect(interpolateDay({ 1: 1, 5: 10, 7: 10, 10: 1 }, 3, true)).toEqual(5.5);
  });

  it("handles empty data", () => {
    expect(interpolateDay({}, 0, false)).toEqual(0);
  });
});

describe("scaleData()", () => {
  it("returns scaled data", () => {
    expect(scaleData({ 1: 1, 2: 2 }, 4, 8)).toEqual({ 1: 4, 4: 8 });
  });

  it("returns scaled data from single data point", () => {
    expect(scaleData({ 1: 1 }, 4, 8)).toEqual({ 1: 8, 4: 8 });
  });
});
