export type PlantGridKey =
  "startX" | "startY" | "spacingH" | "spacingV" | "numPlantsH" | "numPlantsV";

export type PlantGridData = Record<PlantGridKey, number>;

export interface PlantGridState {
  status: "clean" | "dirty",
  grid: PlantGridData;
  gridId: string
}

export interface PlantGridProps {
  xy_swap: boolean;
  openfarm_slug: string;
  cropName: string;
  dispatch: Function;
}

export const plantGridKeys: PlantGridKey[] =
  ["numPlantsH", "numPlantsV", "spacingH", "spacingV", "startX", "startY"];

export const EMPTY_PLANT_GRID: Omit<PlantGridState, "gridId"> = {
  status: "clean",
  grid: {
    startX: 200,
    startY: 200,
    spacingH: 75,
    spacingV: 75,
    numPlantsH: 4,
    numPlantsV: 4,
  }
};
