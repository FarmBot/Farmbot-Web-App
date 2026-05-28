import {
  TaggedFarmwareEnv,
  TaggedGenericPointer, TaggedPoint, TaggedSensorReading, Xyz,
} from "farmbot";
import { AxisNumberProperty } from "../../interfaces";
import { isUndefined, range, round } from "lodash";
import { selectMostRecentPoints } from "../../../recent_points";
import { betterCompact } from "../../../../util";

export type GetColor = (z: number) => { rgb: string, a: number };

export enum InterpolationKey {
  data = "interpolationData",
  hash = "interpolationHash",
  opts = "interpolationOpts",
}

enum MoistureInterpolationKey {
  data = "interpolationDataMoisture",
  hash = "interpolationHashMoisture",
}

export type InterpolationData = Record<Xyz, number>[];

export const getInterpolationData =
  (kind: "Point" | "SensorReading"): InterpolationData =>
    JSON.parse(localStorage.getItem((kind == "SensorReading"
      ? MoistureInterpolationKey
      : InterpolationKey).data) || "[]");

export interface InterpolationOptions {
  stepSize: number;
  useNearest: boolean;
  power: number;
}

export const DEFAULT_INTERPOLATION_OPTIONS: InterpolationOptions = {
  stepSize: 50,
  useNearest: false,
  power: 4,
};

export enum InterpolationOption {
  stepSize = "interpolation_step_size",
  power = "interpolation_power",
  useNearest = "interpolation_use_nearest",
}

const getOptionValue = (farmwareEnvs: TaggedFarmwareEnv[]) =>
  (key: string, defaultValue: number) => {
    const envValue = farmwareEnvs.filter(farmwareEnv =>
      farmwareEnv.body.key == key)[0]?.body.value;
    return parseInt(envValue ? ("" + envValue) : ("" + defaultValue));
  };

export const fetchInterpolationOptions =
  (farmwareEnvs: TaggedFarmwareEnv[]): InterpolationOptions => {
    const getValue = getOptionValue(farmwareEnvs);
    const options: InterpolationOptions = {
      stepSize: getValue(InterpolationOption.stepSize,
        DEFAULT_INTERPOLATION_OPTIONS.stepSize),
      useNearest: getValue(InterpolationOption.useNearest, 0) == 1,
      power: getValue(InterpolationOption.power,
        DEFAULT_INTERPOLATION_OPTIONS.power),
    };
    return options;
  };

export interface GetZAtLocationProps {
  x: number | undefined;
  y: number | undefined;
  farmwareEnvs: TaggedFarmwareEnv[] | undefined;
  points: TaggedGenericPointer[] | undefined;
}

export const getZAtLocation =
  (props: GetZAtLocationProps) => {
    const { x, y, farmwareEnvs, points } = props;
    if (isUndefined(x) || isUndefined(y)
      || isUndefined(farmwareEnvs) || isUndefined(points)) { return; }
    const options = fetchInterpolationOptions(farmwareEnvs);
    const interpolationPoints = selectMostRecentPoints(points);
    return interpolatedZ({ x, y }, interpolationPoints, options);
  };

interface GenerateInterpolationMapDataProps {
  kind: "Point" | "SensorReading";
  points: (TaggedGenericPointer | TaggedSensorReading)[];
  gridSize: AxisNumberProperty;
  getColor: GetColor;
  options: InterpolationOptions;
}

interface PointObject {
  uuid: string;
  x: number;
  y: number;
  value: number;
}

const convertToPointObject =
  (point: TaggedPoint | TaggedSensorReading): PointObject | undefined =>
    !isUndefined(point.body.x) && !isUndefined(point.body.y)
      ? ({
        uuid: point.uuid,
        x: point.body.x, y: point.body.y,
        value: point.kind == "SensorReading" ? point.body.value : point.body.z,
      })
      : undefined;

const convertToPointObjects =
  (points: (TaggedPoint | TaggedSensorReading)[]): PointObject[] =>
    betterCompact(points.map(convertToPointObject));

const getInterpolationPointHash =
  (point: TaggedGenericPointer | TaggedSensorReading) => [
    point.uuid,
    point.body.x,
    point.body.y,
    point.kind == "SensorReading" ? point.body.value : point.body.z,
  ];

export const generateData = (props: GenerateInterpolationMapDataProps) => {
  const points = selectMostRecentPoints(props.points);
  const { gridSize } = props;
  const { stepSize } = props.options;
  const hash = [
    JSON.stringify(points.map(getInterpolationPointHash)),
    JSON.stringify(gridSize),
    JSON.stringify(props.options),
  ].join("");
  const Key = props.kind == "SensorReading"
    ? MoistureInterpolationKey
    : InterpolationKey;
  if (localStorage.getItem(Key.hash) == hash) { return; }
  const data: InterpolationData = [];
  const pointObjects = convertToPointObjects(points);
  range(0, gridSize.x, stepSize).map(x =>
    range(0, gridSize.y, stepSize).map(y => {
      const z = interpolatedZWithPointObjects(
        { x, y }, pointObjects, props.options);
      if (!isUndefined(z)) { data.push({ x, y, z }); }
    }));
  localStorage.setItem(Key.data, JSON.stringify(data));
  localStorage.setItem(Key.hash, hash);
};

export const interpolatedZ = (
  position: { x: number, y: number },
  points: (TaggedPoint | TaggedSensorReading)[],
  options: InterpolationOptions,
) =>
  interpolatedZWithPointObjects(
    position, convertToPointObjects(points), options);

const interpolatedZWithPointObjects = (
  position: { x: number, y: number },
  pointObjects: PointObject[],
  options: InterpolationOptions,
) => {
  const { useNearest, power } = options;
  let nearest: PointObject | undefined;
  let nearestDistanceSquared = Infinity;
  let weightedValueSum = 0;
  let weightSum = 0;
  const weightPower = power / 2;
  for (const point of pointObjects) {
    const xDistance = position.x - point.x;
    const yDistance = position.y - point.y;
    const distanceSquared = xDistance * xDistance + yDistance * yDistance;
    if (distanceSquared < nearestDistanceSquared) {
      nearest = point;
      nearestDistanceSquared = distanceSquared;
    }
    if (distanceSquared == 0) { return point.value; }
    if (!useNearest) {
      const weight = 1 / distanceSquared ** weightPower;
      weightedValueSum += weight * point.value;
      weightSum += weight;
    }
  }
  if (!nearest) { return undefined; }
  if (useNearest) { return nearest.value; }
  return round(weightedValueSum / weightSum, 2);
};
