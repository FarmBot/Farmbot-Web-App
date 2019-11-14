import { TaggedPlant } from "../../map/interfaces";
import { PlantGridData } from "./constants";
import { range } from "lodash";

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

export function initPlantGrid(_params: PlantGridData): TaggedPlant[] {
  const output: TaggedPlant[] = [];
  return output;
}
