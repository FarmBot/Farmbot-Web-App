import { PlantPointer } from "farmbot/dist/resources/api_resources";
import { range } from "lodash";
import { PlantGridData, PlantGridInitOption } from "./interfaces";

const generateXs =
  (start: number, count: number, spacing: number, offsetCol: boolean) =>
    range(start, start + (count * spacing), spacing * (offsetCol ? 2 : 1));

const generateYs =
  (start: number, count: number, spacing: number) =>
    range(start, start + (count * spacing), spacing);

export function vectorGrid(params: PlantGridData, offsetPacking: boolean):
  [number, number][] {
  const { startX, startY, numPlantsH, numPlantsV, spacingH, spacingV } = params;
  const rows = generateYs(startY, numPlantsV, spacingV);
  const cols = generateXs(startX, numPlantsH, spacingH, offsetPacking);

  const results: [number, number][] = [];
  cols.map(x => rows.map(y => results.push([x, y])));

  if (offsetPacking) {
    const offsetRows = generateYs(startY + spacingV / 2, numPlantsV, spacingV);
    const numOffsetCols = numPlantsH % 2 == 0 ? numPlantsH : numPlantsH - 1;
    const offsetCols = generateXs(startX + spacingH, numOffsetCols, spacingH,
      offsetPacking);
    offsetCols.map(x => offsetRows.map(y => results.push([x, y])));
  }

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
  return vectorGrid(p.grid, p.offsetPacking).map(mapper);
};
