import {
  clampGridStart,
  countForAxisDrag,
  DEFAULT_POINT_GRID_RADIUS,
  DEFAULT_POINT_GRID_SPACING,
  gridAxisFromDrag,
  gridBounds,
  gridFromExtent,
  gridInputStep,
  GRID_SPACING_STEP,
  initialPlantGrid,
  MAX_GRID_PLANTS,
  quantizeGridInputValue,
  validatePlantGrid,
} from "../grid_math";
import { PlantGridData } from "../interfaces";

const grid = (
  changes: Partial<PlantGridData> = {},
): PlantGridData => ({
  startX: 100,
  startY: 100,
  spacingH: 100,
  spacingV: 100,
  numPlantsH: 2,
  numPlantsV: 2,
  ...changes,
});

describe("grid planting math", () => {
  it("quantizes spacing inputs to 10 millimeters", () => {
    expect(GRID_SPACING_STEP).toEqual(10);
    expect(gridInputStep("spacingH")).toEqual(10);
    expect(gridInputStep("startX")).toEqual(1);
    expect(quantizeGridInputValue("spacingH", 127)).toEqual(130);
    expect(quantizeGridInputValue("spacingV", -124)).toEqual(-120);
    expect(quantizeGridInputValue("spacingH", 1)).toEqual(10);
    expect(quantizeGridInputValue("spacingH", 0)).toEqual(0);
    expect(quantizeGridInputValue("startX", 127)).toEqual(127);
  });

  it("provides point grid workflow defaults", () => {
    expect(DEFAULT_POINT_GRID_RADIUS).toEqual(0);
    expect(DEFAULT_POINT_GRID_SPACING).toEqual(100);
  });

  it("creates a grid at the requested starting point", () => {
    expect(initialPlantGrid({ x: 10, y: 20 }, 75)).toEqual({
      startX: 10,
      startY: 20,
      spacingH: 75,
      spacingV: 75,
      numPlantsH: 2,
      numPlantsV: 3,
    });
  });

  it("validates plant counts, spacing, limits, and bounds", () => {
    expect(validatePlantGrid(grid(), false, { x: 500, y: 500 }))
      .toEqual({
        valid: true,
        errors: [],
        points: [
          [100, 100],
          [100, 200],
          [200, 100],
          [200, 200],
        ],
      });
    expect(validatePlantGrid(grid({
      numPlantsH: 0,
      spacingH: 0,
      spacingV: 0,
    }), false).errors).toContain(
      "Plant counts must be positive whole numbers.");
    expect(validatePlantGrid(grid({
      spacingH: 0,
    }), false).errors).toContain("X spacing must not be zero.");
    expect(validatePlantGrid(grid({
      spacingH: 0,
      numPlantsH: 1,
    }), false)).toEqual(expect.objectContaining({
      valid: false,
      points: [],
    }));
    expect(validatePlantGrid(grid({
      startX: 450,
    }), false, { x: 500, y: 500 }).errors).toContain(
      "All plants must be within the planting area.");
    expect(validatePlantGrid(grid({
      startX: Infinity,
    }), false).errors).toContain("All grid values must be numbers.");
  });

  it("bounds oversized previews while reporting the limit", () => {
    const result = validatePlantGrid(grid({
      spacingH: 1,
      spacingV: 1,
      numPlantsH: 1000,
      numPlantsV: 1000,
    }), false);
    expect(result.valid).toBeFalsy();
    expect(result.errors).toContain(
      `A grid can contain at most ${MAX_GRID_PLANTS} plants.`);
    expect(result.points).toHaveLength(MAX_GRID_PLANTS);
  });

  it("builds positive, negative, and single-axis extents", () => {
    const common = {
      start: { x: 500, y: 500 },
      spacing: { x: 100, y: 100 },
      previousSpacing: { x: 100, y: 100 },
      gridSize: { x: 1000, y: 1000 },
    };
    expect(gridFromExtent({
      ...common,
      pointer: { x: 800, y: 500 },
    })).toEqual({
      startX: 500,
      startY: 500,
      spacingH: 100,
      spacingV: 100,
      numPlantsH: 4,
      numPlantsV: 1,
    });
    expect(gridFromExtent({
      ...common,
      pointer: { x: 300, y: 200 },
    })).toEqual({
      startX: 500,
      startY: 500,
      spacingH: -100,
      spacingV: -100,
      numPlantsH: 3,
      numPlantsV: 4,
    });
  });

  it("rounds extents at half-grid boundaries", () => {
    const common = {
      start: { x: 100, y: 100 },
      spacing: { x: 100, y: 100 },
      previousSpacing: { x: 100, y: 100 },
      gridSize: { x: 1000, y: 1000 },
    };
    expect(gridFromExtent({
      ...common,
      pointer: { x: 101, y: 199 },
    })).toEqual(expect.objectContaining({
      numPlantsH: 1,
      numPlantsV: 2,
    }));
    expect(gridFromExtent({
      ...common,
      pointer: { x: 200, y: 200 },
    })).toEqual(expect.objectContaining({
      numPlantsH: 2,
      numPlantsV: 2,
    }));
    expect(gridFromExtent({
      ...common,
      pointer: { x: 99, y: 99 },
    })).toEqual(expect.objectContaining({
      spacingH: 100,
      spacingV: 100,
      numPlantsH: 1,
      numPlantsV: 1,
    }));
    expect(gridFromExtent({
      ...common,
      pointer: { x: 51, y: 51 },
    })).toEqual(expect.objectContaining({
      spacingH: 100,
      spacingV: 100,
      numPlantsH: 1,
      numPlantsV: 1,
    }));
    expect(gridFromExtent({
      ...common,
      pointer: { x: 50, y: 50 },
    })).toEqual(expect.objectContaining({
      spacingH: -100,
      spacingV: -100,
      numPlantsH: 2,
      numPlantsV: 2,
    }));
    expect(gridFromExtent({
      ...common,
      pointer: { x: 249, y: 249 },
    })).toEqual(expect.objectContaining({
      numPlantsH: 2,
      numPlantsV: 2,
    }));
    expect(gridFromExtent({
      ...common,
      pointer: { x: 250, y: 250 },
    })).toEqual(expect.objectContaining({
      numPlantsH: 3,
      numPlantsV: 3,
    }));
  });

  it("keeps extents within the bed and maximum plant count", () => {
    const result = gridFromExtent({
      start: { x: 0, y: 0 },
      pointer: { x: 10000, y: 10000 },
      spacing: { x: 1, y: 1 },
      previousSpacing: { x: 1, y: 1 },
      gridSize: { x: 10000, y: 10000 },
    });
    expect(result.numPlantsH * result.numPlantsV)
      .toBeLessThanOrEqual(MAX_GRID_PLANTS);
  });

  it("clamps a dragged grid without changing its shape", () => {
    expect(clampGridStart(
      grid({
        startX: 0,
        startY: 0,
        spacingH: -100,
        spacingV: -100,
        numPlantsH: 3,
        numPlantsV: 3,
      }),
      false,
      { x: 10, y: 20 },
      { x: 1000, y: 1000 },
    )).toEqual({ x: 200, y: 200 });
    expect(clampGridStart(
      grid({
        startX: 0,
        startY: 0,
        spacingH: -87,
        spacingV: -87,
        numPlantsH: 3,
        numPlantsV: 3,
      }),
      false,
      { x: 10, y: 20 },
      { x: 1000, y: 1000 },
      10,
    )).toEqual({ x: 180, y: 180 });
  });

  it("calculates packed bounds without expanding the point array", () => {
    expect(gridBounds(grid(), true)).toEqual({
      minX: 100,
      maxX: 200,
      minY: 100,
      maxY: 250,
    });
    expect(gridBounds(grid({
      spacingV: -100,
      numPlantsH: 1000000,
      numPlantsV: 2,
    }), true)).toEqual({
      minX: 100,
      maxX: 100000000,
      minY: -50,
      maxY: 100,
    });
  });

  it("converts axis drags into bounded plant counts", () => {
    expect(countForAxisDrag(100, 400, 100, 2, 1000)).toEqual(4);
    expect(countForAxisDrag(500, 200, -100, 2, 1000)).toEqual(4);
    expect(countForAxisDrag(100, 249, 100, 2, 1000)).toEqual(2);
    expect(countForAxisDrag(100, 250, 100, 2, 1000)).toEqual(3);
    expect(countForAxisDrag(100, 299, 100, 2, 1000)).toEqual(3);
    expect(countForAxisDrag(100, 300, 100, 2, 1000)).toEqual(3);
    expect(countForAxisDrag(500, 351, -100, 2, 1000)).toEqual(2);
    expect(countForAxisDrag(500, 350, -100, 2, 1000)).toEqual(3);
    expect(countForAxisDrag(0, 10000, 1, 10, 10000))
      .toBeLessThanOrEqual(MAX_GRID_PLANTS / 10);
  });

  it("reverses signed spacing after dragging through the start", () => {
    expect(gridAxisFromDrag(500, 300, 100, 2, 1000)).toEqual({
      count: 3,
      spacing: -100,
    });
    expect(gridAxisFromDrag(500, 451, 100, 2, 1000)).toEqual({
      count: 1,
      spacing: 100,
    });
    expect(gridAxisFromDrag(500, 300, 0, 2, 1000)).toEqual({
      count: 1,
      spacing: 0,
    });
  });
});
