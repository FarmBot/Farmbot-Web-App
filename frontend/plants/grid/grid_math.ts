import { clamp } from "lodash";
import { AxisNumberProperty } from "../../farm_designer/map/interfaces";
import { PlantGridData, PlantGridKey } from "./interfaces";
import { vectorGrid } from "./generate_grid";

export const MAX_GRID_PLANTS = 200;

export const gridInputStep = (_key: PlantGridKey) => 1;

export const initialPlantGrid = (
  start: AxisNumberProperty,
  spacing: number,
  counts = { x: 2, y: 3 },
): PlantGridData => ({
  startX: start.x,
  startY: start.y,
  spacingH: spacing,
  spacingV: spacing,
  numPlantsH: counts.x,
  numPlantsV: counts.y,
});

export const gridPlantCount = (grid: PlantGridData) =>
  grid.numPlantsH * grid.numPlantsV;

export interface PlantGridValidation {
  valid: boolean;
  errors: string[];
  points: [number, number][];
}

export const validatePlantGrid = (
  grid: PlantGridData,
  offsetPacking: boolean,
  gridSize?: AxisNumberProperty,
): PlantGridValidation => {
  const errors: string[] = [];
  const counts = [grid.numPlantsH, grid.numPlantsV];
  if (counts.some(value => !Number.isInteger(value) || value < 1)) {
    errors.push("Plant counts must be positive whole numbers.");
  }
  if (grid.spacingH == 0) {
    errors.push("X spacing must not be zero.");
  }
  if (grid.spacingV == 0) {
    errors.push("Y spacing must not be zero.");
  }
  if (gridPlantCount(grid) > MAX_GRID_PLANTS) {
    errors.push(`A grid can contain at most ${MAX_GRID_PLANTS} plants.`);
  }
  const values = Object.values(grid);
  if (values.some(value => !Number.isFinite(value))) {
    errors.push("All grid values must be numbers.");
  }
  const canGenerate = errors.length == 0
    || errors.every(error => error.startsWith("A grid can contain"));
  const safeNumPlantsH = Math.min(grid.numPlantsH, MAX_GRID_PLANTS);
  const safeGrid = {
    ...grid,
    numPlantsH: safeNumPlantsH,
    numPlantsV: Math.min(
      grid.numPlantsV,
      Math.max(1, Math.floor(MAX_GRID_PLANTS / safeNumPlantsH)),
    ),
  };
  const points = canGenerate ? vectorGrid(safeGrid, offsetPacking) : [];
  if (gridSize && points.some(([x, y]) =>
    x < 0 || y < 0 || x > gridSize.x || y > gridSize.y)) {
    errors.push("All plants must be within the planting area.");
  }
  return { valid: errors.length == 0, errors, points };
};

export interface GridExtentProps {
  start: AxisNumberProperty;
  pointer: AxisNumberProperty;
  spacing: AxisNumberProperty;
  previousSpacing: AxisNumberProperty;
  baseCounts?: AxisNumberProperty;
  gridSize: AxisNumberProperty;
}

const extentForAxis = (
  start: number,
  pointer: number,
  spacing: number,
  previousSpacing: number,
  limit: number,
  baseCount = 1,
) => {
  const magnitude = Math.max(1, Math.abs(spacing));
  const delta = pointer - start;
  const distance = Math.abs(delta);
  const pointerDirection = Math.sign(delta);
  const initialDirection = Math.sign(previousSpacing) || 1;
  const initialCount = Math.max(1, Math.floor(baseCount));
  const reversingInitialExtent =
    initialCount > 1
    && pointerDirection != 0
    && pointerDirection != initialDirection;
  if (reversingInitialExtent && distance < magnitude) {
    const count = distance < magnitude / 2 ? initialCount : 1;
    const available = initialDirection > 0 ? limit - start : start;
    const maxCount = Math.max(
      initialCount,
      Math.floor(available / magnitude) + 1,
    );
    return {
      count: Math.min(count, maxCount),
      spacing: initialDirection * magnitude,
    };
  }
  const direction = pointerDirection == 0
    ? Math.sign(previousSpacing) || 1
    : pointerDirection;
  const available = direction > 0 ? limit - start : start;
  const maxIndex = Math.max(0, Math.floor(available / magnitude));
  const maxCount = direction == initialDirection
    ? Math.max(initialCount, maxIndex + 1)
    : maxIndex + 1;
  const index = clamp(
    Math.floor(distance / magnitude), 0, maxIndex);
  const countFromPointer = index + (
    pointerDirection == 0 || direction == initialDirection
      ? initialCount
      : 1
  );
  return {
    count: Math.min(countFromPointer, maxCount),
    spacing: direction * magnitude,
  };
};

export const gridFromExtent = (props: GridExtentProps): PlantGridData => {
  const x = extentForAxis(
    props.start.x,
    props.pointer.x,
    props.spacing.x,
    props.previousSpacing.x,
    props.gridSize.x,
    props.baseCounts?.x,
  );
  const y = extentForAxis(
    props.start.y,
    props.pointer.y,
    props.spacing.y,
    props.previousSpacing.y,
    props.gridSize.y,
    props.baseCounts?.y,
  );
  const numPlantsH = Math.min(x.count, MAX_GRID_PLANTS);
  const numPlantsV = Math.min(
    y.count,
    Math.max(1, Math.floor(MAX_GRID_PLANTS / numPlantsH)),
  );
  return {
    startX: props.start.x,
    startY: props.start.y,
    spacingH: x.spacing,
    spacingV: y.spacing,
    numPlantsH,
    numPlantsV,
  };
};

export const gridBounds = (
  grid: PlantGridData,
  offsetPacking: boolean,
) => {
  const numPlantsH = Number.isFinite(grid.numPlantsH)
    ? Math.max(1, Math.floor(grid.numPlantsH))
    : 1;
  const numPlantsV = Number.isFinite(grid.numPlantsV)
    ? Math.max(1, Math.floor(grid.numPlantsV))
    : 1;
  const xEnd = grid.startX + grid.spacingH * (numPlantsH - 1);
  const yEnd = grid.startY + grid.spacingV * (numPlantsV - 1);
  const xs = [grid.startX, xEnd];
  const ys = [grid.startY, yEnd];
  if (offsetPacking && numPlantsH > 1) {
    const offsetStart = grid.startY + grid.spacingV / 2;
    const offsetEnd = offsetStart + grid.spacingV * (numPlantsV - 1);
    ys.push(offsetStart, offsetEnd);
  }
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
};

export const clampGridStart = (
  grid: PlantGridData,
  offsetPacking: boolean,
  requested: AxisNumberProperty,
  gridSize: AxisNumberProperty,
): AxisNumberProperty => {
  const requestedGrid = {
    ...grid,
    startX: requested.x,
    startY: requested.y,
  };
  const bounds = gridBounds(requestedGrid, offsetPacking);
  let x = requested.x;
  let y = requested.y;
  if (bounds.minX < 0) { x -= bounds.minX; }
  if (bounds.maxX > gridSize.x) { x -= bounds.maxX - gridSize.x; }
  if (bounds.minY < 0) { y -= bounds.minY; }
  if (bounds.maxY > gridSize.y) { y -= bounds.maxY - gridSize.y; }
  return {
    x: clamp(Math.round(x), 0, gridSize.x),
    y: clamp(Math.round(y), 0, gridSize.y),
  };
};

export const countForAxisDrag = (
  start: number,
  pointer: number,
  spacing: number,
  otherCount: number,
  limit: number,
) => {
  if (spacing == 0) { return 1; }
  const direction = Math.sign(spacing);
  const available = direction > 0 ? limit - start : start;
  const boundaryCount = Math.floor(available / Math.abs(spacing)) + 1;
  const pointerCount =
    Math.floor(Math.abs(pointer - start) / Math.abs(spacing)) + 1;
  const totalCount = Math.max(1, Math.floor(
    MAX_GRID_PLANTS / Math.max(1, otherCount)));
  return clamp(pointerCount, 1, Math.min(boundaryCount, totalCount));
};
