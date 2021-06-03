import {
  PlantPointer, GenericPointer,
} from "farmbot/dist/resources/api_resources";
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
  (openfarm_slug: string, cropName: string, gridId: string) =>
    (vec: [number, number]): PlantPointer => {
      const [x, y] = vec;
      return {
        name: cropName,
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

const createPointGridMapper = (
  color: string | undefined,
  radius: number | undefined,
  z: number | undefined,
  pointName: string,
  gridId: string,
) =>
  (vec: [number, number]): GenericPointer => {
    const [x, y] = vec;
    return {
      name: pointName,
      radius: radius || 25,
      z: z || 0,
      x,
      y,
      pointer_type: "GenericPointer",
      meta: { gridId, color }
    };
  };

export const initPlantGrid =
  (p: PlantGridInitOption): (GenericPointer | PlantPointer)[] => {
    const mapper: (vec: [number, number]) => GenericPointer | PlantPointer =
      !p.openfarm_slug
        ? createPointGridMapper(p.color, p.radius, p.z, p.itemName, p.gridId)
        : createPlantGridMapper(p.openfarm_slug, p.itemName, p.gridId);
    return vectorGrid(p.grid, p.offsetPacking).map(mapper);
  };
