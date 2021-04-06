import React from "react";
import { TaggedGenericPointer, Xyz } from "farmbot";
import { MapTransformProps } from "../../interfaces";
import { transformXY } from "../../util";
import { range, sortBy } from "lodash";
import { findNearest } from "../../../../point_groups/paths";
import { groupItemsByLocation } from "../../../location_info";

export enum InterpolationKey {
  data = "interpolationData",
  hash = "interpolationHash",
  step = "interpolationStep",
}

export type InterpolationData = Record<Xyz, number>[];

export const getInterpolationData = (): InterpolationData =>
  JSON.parse(localStorage.getItem(InterpolationKey.data) || "[]");

interface GenerateInterpolationMapDataProps {
  genericPoints: TaggedGenericPointer[];
  mapTransformProps: MapTransformProps;
  getColor(z: number): string;
  stepSize: number;
}

export const generateData = (props: GenerateInterpolationMapDataProps) => {
  const soilHeightPoints = sortBy(groupItemsByLocation(props.genericPoints
    .filter(p => p.body.meta.at_soil_level), undefined), "points.body.created_at")
    .map(data => data.items[0]);
  const gridX = props.mapTransformProps.gridSize.x;
  const gridY = props.mapTransformProps.gridSize.y;
  const step = props.stepSize;
  const hash = [JSON.stringify(soilHeightPoints), gridX, gridY, step].join("");
  if (localStorage.getItem(InterpolationKey.hash) == hash) { return; }
  const data: InterpolationData = [];
  range(0, gridX, step).map(x =>
    range(0, gridY, step).map(y => {
      if (soilHeightPoints.length > 0) {
        const nearest = findNearest({ x, y }, soilHeightPoints);
        data.push({ x, y, z: nearest.body.z });
      }
    }));
  localStorage.setItem(InterpolationKey.data, JSON.stringify(data));
  localStorage.setItem(InterpolationKey.hash, hash);
};

interface InterpolationMapProps {
  genericPoints: TaggedGenericPointer[];
  mapTransformProps: MapTransformProps;
  getColor(z: number): string;
  stepSize: number;
}

export const InterpolationMap = (props: InterpolationMapProps) => {
  const step = props.stepSize;
  return <g id={"interpolation-map"}>
    {getInterpolationData().map(p => {
      const { x, y, z } = p;
      const { qx, qy } = transformXY(x, y, props.mapTransformProps);
      return <rect key={`${x}-${y}`}
        x={qx - step / 2} y={qy - step / 2} width={step} height={step}
        fill={props.getColor(z)} fillOpacity={0.85} />;
    })}
  </g>;
};
