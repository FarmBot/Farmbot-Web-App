export type PlantGridKey =
  "startX" | "startY" | "spacingH" | "spacingV" | "numPlantsH" | "numPlantsV";

export type PlantGridData = Record<PlantGridKey, number>;

export interface PlantGridState {
  status: "clean" | "dirty",
  grid: PlantGridData;
  gridId: string
}

export interface PlantGridProps {
  openfarm_slug: string;
  dispatch: Function;
}

export const plantGridKeys: PlantGridKey[] =
  ["numPlantsH", "numPlantsV", "spacingH", "spacingV", "startX", "startY"];

export const EMPTY_PLANT_GRID: Omit<PlantGridState, "gridId"> = {
  status: "clean",
  grid: {
    startX: 100,
    startY: 100,
    spacingH: 50,
    spacingV: 50,
    numPlantsH: 7,
    numPlantsV: 7,
  }
};
