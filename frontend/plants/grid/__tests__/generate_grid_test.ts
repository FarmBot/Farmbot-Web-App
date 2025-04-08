import { vectorGrid, initPlantGrid } from "../generate_grid";
import { PlantGridData, PlantGridKey } from "../interfaces";
import { fakeDesignerState } from "../../../__test_support__/fake_designer_state";

const testGridInputs = (): PlantGridData => ({
  startX: 11,
  startY: 31,
  spacingH: 5,
  spacingV: 7,
  numPlantsH: 2,
  numPlantsV: 3
});

const gridCol1 = [
  [11, 31],
  [11, 38],
  [11, 45],
];

const rectGridCol2 = [
  [16, 31],
  [16, 38],
  [16, 45],
];

const offsetGridCol2 = [
  [16, 34.5],
  [16, 41.5],
  [16, 48.5],
];

const offsetGridCol3 = [
  [21, 31],
  [21, 38],
  [21, 45],
];

const expectedGrid = gridCol1.concat(rectGridCol2);
const expectedOffsetGrid = gridCol1.concat(offsetGridCol2);
const expectedLargerOffsetGrid =
  gridCol1
    .concat(offsetGridCol3)
    .concat(offsetGridCol2);

describe("initPlantGrid", () => {
  it("saves the grid", () => {
    const result = initPlantGrid({
      grid: testGridInputs(),
      openfarm_slug: "slug",
      itemName: "beets",
      gridId: "123",
      offsetPacking: false,
      z: 0,
      designer: fakeDesignerState(),
    });
    expect(result.length).toEqual(expectedGrid.length);
    expect(result[0].pointer_type).toEqual("Plant");
    const vectors = result.map(x => [x.x, x.y]);
    expect(vectors).toEqual(expectedGrid);
  });

  it("saves a point grid", () => {
    const result = initPlantGrid({
      grid: testGridInputs(),
      itemName: "grid point",
      gridId: "123",
      offsetPacking: false,
      radius: 100,
      z: 0,
      meta: { color: "green" },
      designer: fakeDesignerState(),
    });
    expect(result.length).toEqual(expectedGrid.length);
    expect(result[0].pointer_type).toEqual("GenericPointer");
    expect(result[0].radius).toEqual(100);
    expect(result[0].meta.color).toEqual("green");
  });

  it("saves a point grid using defaults", () => {
    const result = initPlantGrid({
      grid: testGridInputs(),
      itemName: "grid point",
      gridId: "123",
      offsetPacking: false,
      z: 0,
    });
    expect(result.length).toEqual(expectedGrid.length);
    expect(result[0].pointer_type).toEqual("GenericPointer");
    expect(result[0].radius).toEqual(0);
  });
});

describe("vectorGrid", () => {
  it("handles zeros (edge case)", () => {
    const gridInputs = testGridInputs();
    Object.keys(gridInputs).map((input: PlantGridKey) => gridInputs[input] = 0);
    const results = vectorGrid(gridInputs, false);
    expect(results).toEqual([]);
  });

  it("generates a grid", () => {
    const gridInputs = testGridInputs();
    const results = vectorGrid(gridInputs, false);
    expect(results.length).toEqual(gridInputs.numPlantsH * gridInputs.numPlantsV);
    expect(results).toEqual(expectedGrid);
  });

  it("generates a packed grid", () => {
    const gridInputs = testGridInputs();
    const results = vectorGrid(gridInputs, true);
    expect(results.length).toEqual(gridInputs.numPlantsH * gridInputs.numPlantsV);
    expect(results).toEqual(expectedOffsetGrid);
  });

  it("generates a larger packed grid", () => {
    const gridInputs = testGridInputs();
    gridInputs.numPlantsH = 3;
    const results = vectorGrid(gridInputs, true);
    expect(results.length).toEqual(gridInputs.numPlantsH * gridInputs.numPlantsV);
    expect(results).toEqual(expectedLargerOffsetGrid);
  });
});
