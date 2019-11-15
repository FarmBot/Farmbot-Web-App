import { PlantGridData } from "./constants";
import { range } from "lodash";
import { PlantPointer } from "farmbot/dist/resources/api_resources";

export function vectorGrid(params: PlantGridData): [number, number][] {
  const rows = range(params.startX,
    params.startX + (params.numPlantsH * params.spacingH),
    params.spacingH);

  const cols = range(params.startY,
    params.startY + (params.numPlantsV * params.spacingV),
    params.spacingV);

  const results: [number, number][] = [];

  rows.map(x => cols.map(y => results.push([x, y])));

  return results;
}

const createPlant = (openfarm_slug: string, gridId: string) =>
  (vec: [number, number]): PlantPointer => {
    const [x, y] = vec;
    return {
      name: openfarm_slug,
      radius: 25,
      z: 0,
      x,
      y,
      openfarm_slug,
      pointer_type: "Plant",
      plant_stage: "planted",
      meta: { gridId }
    };
  };

interface PlantGridInitOption {
  grid: PlantGridData;
  openfarm_slug: string;
  gridId: string;
}

export const initPlantGrid =
  ({ grid, openfarm_slug, gridId }: PlantGridInitOption): PlantPointer[] => {
    const mapper = createPlant(openfarm_slug, gridId);
    return vectorGrid(grid).map(mapper);
  };
