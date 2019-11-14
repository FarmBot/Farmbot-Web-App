import { vectorGrid } from "../generate_grid";

describe("vectorGrid", () => {
  it("handles zeros (edge case)", () => {
    const results = vectorGrid({
      startX: 0,
      startY: 0,
      spacingH: 0,
      spacingV: 0,
      numPlantsH: 0,
      numPlantsV: 0,
    });
    expect(results).toEqual([]);
  });

  it("generates a grid", () => {
    const p = { // Prime numbers yeah
      startX: 11,
      startY: 31,
      spacingH: 5,
      spacingV: 7,
      numPlantsH: 2,
      numPlantsV: 3
    };
    const results = vectorGrid(p);
    expect(results.length).toEqual(p.numPlantsH * p.numPlantsV);
    const expected = JSON.stringify([
      [11, 31],
      [11, 38],
      [11, 45],
      [16, 31],
      [16, 38],
      [16, 45]
    ]);
    expect(JSON.stringify(results)).toEqual(expected);
  });
});
