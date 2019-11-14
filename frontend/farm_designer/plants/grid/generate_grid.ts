import { PlantGridData } from "./constants";
import { range } from "lodash";
import { uuid } from "farmbot";
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

const createPlant = (p: PlantGridData, openfarm_slug: string, gridId: string) =>
  (vec: [number, number]): PlantPointer => {
    const [x, y] = vec;
    return {
      name: `${openfarm_slug} ${p.numPlantsH}x${p.numPlantsV}`,
      radius: 0,
      z: 0,
      x,
      y,
      openfarm_slug,
      pointer_type: "Plant",
      plant_stage: "planted",
      meta: { gridId }
    };
  };

export function initPlantGrid(p: PlantGridData, openfarm_slug: string): PlantPointer[] {
  const gridId = uuid();
  const mapper = createPlant(p, openfarm_slug, gridId);
  return vectorGrid(p).map(mapper);
}
