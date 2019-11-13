export type PlantGridKey =
  "startX" | "startY" | "spacingH" | "spacingV" | "numPlantsH" | "numPlantsV";

export interface PlantGridState {
  status: "clean" | "dirty",
  grid: Record<PlantGridKey, number>;
}

export interface PlantGridProps {
  dispatch: Function;
}

export const plantGridKeys: PlantGridKey[] =
  ["numPlantsH", "numPlantsV", "spacingH", "spacingV", "startX", "startY"];

export const EMPTY_PLANT_GRID: PlantGridState = {
  status: "clean",
  grid: {
    startX: 0,
    startY: 0,
    spacingH: 0,
    spacingV: 0,
    numPlantsH: 0,
    numPlantsV: 0,
  }
};
