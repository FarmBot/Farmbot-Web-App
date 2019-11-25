import { PlantPointer } from "farmbot/dist/resources/api_resources";
import { range } from "lodash";
import { PlantGridData } from "./constants";

interface PlantGridInitOption {
  grid: PlantGridData;
  openfarm_slug: string;
  cropName: string;
  gridId: string;
}

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

const createPlantGridMapper =
  (openfarm_slug: string, name: string, gridId: string) =>
    (vec: [number, number]): PlantPointer => {
      const [x, y] = vec;
      return {
        name,
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

export const initPlantGrid = (p: PlantGridInitOption): PlantPointer[] => {
  const mapper = createPlantGridMapper(p.openfarm_slug, p.cropName, p.gridId);
  return vectorGrid(p.grid).map(mapper);
};
