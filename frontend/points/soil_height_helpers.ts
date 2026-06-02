import { TaggedGenericPointer, TaggedPoint } from "farmbot";
import { round } from "lodash";

export const MEASURE_SOIL_HEIGHT_NAME = "measure-soil-height";

export const soilHeightPoint = (point: TaggedPoint) =>
  (point.body.meta.created_by == MEASURE_SOIL_HEIGHT_NAME
    || point.body.meta.at_soil_level == "true")
  && point.body.meta.at_soil_level != "false";

export const tagAsSoilHeight = (point: TaggedGenericPointer) => {
  point.body.meta.at_soil_level = "true";
  return point;
};

export const toggleSoilHeight = (point: TaggedPoint) => ({
  meta: {
    ...point.body.meta,
    at_soil_level: "" + !soilHeightPoint(point),
  }
});

export const soilHeightQuery: Record<string, string> = {
  at_soil_level: "true",
};

export const soilHeightColorQuery = (color: string) => ({
  at_soil_level: "true",
  color,
});

export const getSoilHeightColor =
  (genericPoints: TaggedGenericPointer[]) => {
    const soilHeights = genericPoints
      .filter(soilHeightPoint)
      .map(p => p.body.z);
    const min = Math.min(...soilHeights);
    const max = Math.max(...soilHeights);
    return (z: number) => {
      const normalizedZ = round(255 * (max > min ? (z - min) / (max - min) : 1));
      return {
        rgb: `rgb(${normalizedZ}, ${normalizedZ}, ${normalizedZ})`,
        a: 1,
      };
    };
  };
