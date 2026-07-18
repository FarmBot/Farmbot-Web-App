import { clamp } from "lodash";
import { AxisNumberProperty } from "../../farm_designer/map/interfaces";
import { PlantGridData, PlantGridKey } from "./interfaces";
import { vectorGrid } from "./generate_grid";

export const MAX_GRID_PLANTS = 200;
export const GRID_SPACING_STEP = 10;
export const DEFAULT_POINT_GRID_RADIUS = 0;
export const DEFAULT_POINT_GRID_SPACING = 100;

const isSpacingKey = (key: PlantGridKey) =>
  key == "spacingH" || key == "spacingV";

export const gridInputStep = (key: PlantGridKey) =>
  isSpacingKey(key) ? GRID_SPACING_STEP : 1;

export const quantizeGridInputValue = (
  key: PlantGridKey,
  value: number,
) => {
  if (!isSpacingKey(key) || value == 0) { return value; }
  return Math.sign(value) * Math.max(
    GRID_SPACING_STEP,
    Math.round(Math.abs(value) / GRID_SPACING_STEP) * GRID_SPACING_STEP,
  );
};

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
  gridSize: AxisNumberProperty;
}

const extentForAxis = (
  start: number,
  pointer: number,
  spacing: number,
  previousSpacing: number,
  limit: number,
) => {
  const magnitude = Math.max(1, Math.abs(spacing));
  const delta = pointer - start;
  const distance = Math.abs(delta);
  const pointerDirection = Math.sign(delta);
  const initialDirection = Math.sign(previousSpacing) || 1;
  const nearestIndex = Math.floor(distance / magnitude + 0.5);
  const direction = nearestIndex == 0 || pointerDirection == 0
    ? initialDirection
    : pointerDirection;
  const available = direction > 0 ? limit - start : start;
  const maxIndex = Math.max(0, Math.floor(available / magnitude));
  return {
    count: clamp(nearestIndex, 0, maxIndex) + 1,
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
  );
  const y = extentForAxis(
    props.start.y,
    props.pointer.y,
    props.spacing.y,
    props.previousSpacing.y,
    props.gridSize.y,
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
  step = 1,
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
  const snapWithinBounds = (
    value: number,
    min: number,
    max: number,
  ) => {
    if (step <= 1 || min > max) { return value; }
    const snappedMin = Math.ceil(min / step) * step;
    const snappedMax = Math.floor(max / step) * step;
    return snappedMin <= snappedMax
      ? clamp(Math.round(value / step) * step, snappedMin, snappedMax)
      : value;
  };
  const minX = requested.x - bounds.minX;
  const maxX = requested.x + gridSize.x - bounds.maxX;
  const minY = requested.y - bounds.minY;
  const maxY = requested.y + gridSize.y - bounds.maxY;
  return {
    x: clamp(Math.round(snapWithinBounds(x, minX, maxX)), 0, gridSize.x),
    y: clamp(Math.round(snapWithinBounds(y, minY, maxY)), 0, gridSize.y),
  };
};

export const countForAxisDrag = (
  start: number,
  pointer: number,
  spacing: number,
  otherCount: number,
  limit: number,
) => gridAxisFromDrag(
  start,
  pointer,
  spacing,
  otherCount,
  limit,
).count;

export const gridAxisFromDrag = (
  start: number,
  pointer: number,
  spacing: number,
  otherCount: number,
  limit: number,
) => {
  if (spacing == 0) { return { count: 1, spacing: 0 }; }
  const magnitude = Math.abs(spacing);
  const previousDirection = Math.sign(spacing);
  const delta = pointer - start;
  const nearestIndex = Math.floor(Math.abs(delta) / magnitude + 0.5);
  const pointerDirection = Math.sign(delta);
  const direction = nearestIndex > 0 && pointerDirection != 0
    ? pointerDirection
    : previousDirection;
  const available = direction > 0 ? limit - start : start;
  const boundaryCount = Math.floor(available / magnitude) + 1;
  const pointerCount = nearestIndex + 1;
  const totalCount = Math.max(1, Math.floor(
    MAX_GRID_PLANTS / Math.max(1, otherCount)));
  return {
    count: clamp(pointerCount, 1, Math.min(boundaryCount, totalCount)),
    spacing: direction * magnitude,
  };
};
