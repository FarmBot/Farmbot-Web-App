export type PlantGridKey =
  "startX" | "startY" | "spacingH" | "spacingV" | "numPlantsH" | "numPlantsV";

export type PlantGridData = Record<PlantGridKey, number>;

export interface PlantGridState {
  status: "clean" | "dirty",
  grid: PlantGridData;
}

export interface PlantGridProps {
  openfarm_slug: string;
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
