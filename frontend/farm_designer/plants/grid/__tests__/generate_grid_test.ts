import { vectorGrid, initPlantGrid } from "../generate_grid";
export const testGrid = { // Prime numbers yeah
  startX: 11,
  startY: 31,
  spacingH: 5,
  spacingV: 7,
  numPlantsH: 2,
  numPlantsV: 3
};

const expectedResultsOfTestGrid = [
  [11, 31],
  [11, 38],
  [11, 45],
  [16, 31],
  [16, 38],
  [16, 45]
];

describe("initPlantGrid", () => {
  it("saves the grid", () => {
    const result = initPlantGrid({
      grid: testGrid,
      openfarm_slug: "slug",
      cropName: "beets",
      gridId: "123"
    });
    expect(result.length).toEqual(expectedResultsOfTestGrid.length);
    const vectors = result.map(x => [x.x, x.y]);
    expect(vectors).toEqual(expectedResultsOfTestGrid);
  });
});

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
    const results = vectorGrid(testGrid);
    expect(results.length).toEqual(testGrid.numPlantsH * testGrid.numPlantsV);
    const expected = JSON.stringify(expectedResultsOfTestGrid);
    expect(JSON.stringify(results)).toEqual(expected);
  });
});
