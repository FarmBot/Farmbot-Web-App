import React from "react";
import {
  TaggedFarmwareEnv,
  TaggedGenericPointer, TaggedPoint, TaggedSensorReading, Xyz,
} from "farmbot";
import { MapTransformProps } from "../../interfaces";
import { transformXY } from "../../util";
import { isUndefined, range, round, sum } from "lodash";
import { distance, findNearest } from "../../../../point_groups/paths";
import { selectMostRecentPoints } from "../../../location_info";
import { betterCompact } from "../../../../util";
import { t } from "../../../../i18next_wrapper";
import { BlurableInput, ToggleButton } from "../../../../ui";
import {
  getModifiedClassNameSpecifyDefault,
} from "../../../../settings/default_values";
import { SaveFarmwareEnv } from "../../../../farmware/interfaces";

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

interface InterpolationOptions {
  stepSize: number;
  useNearest: boolean;
  power: number;
}

export const DEFAULT_INTERPOLATION_OPTIONS: InterpolationOptions = {
  stepSize: 50,
  useNearest: false,
  power: 4,
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
  mapTransformProps: MapTransformProps;
  getColor(z: number): string;
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

export const generateData = (props: GenerateInterpolationMapDataProps) => {
  const points = selectMostRecentPoints(props.points);
  const { gridSize } = props.mapTransformProps;
  const { stepSize } = props.options;
  const hash = [
    JSON.stringify(points),
    JSON.stringify(gridSize),
    JSON.stringify(props.options),
  ].join("");
  const Key = props.kind == "SensorReading"
    ? MoistureInterpolationKey
    : InterpolationKey;
  if (localStorage.getItem(Key.hash) == hash) { return; }
  const data: InterpolationData = [];
  range(0, gridSize.x, stepSize).map(x =>
    range(0, gridSize.y, stepSize).map(y => {
      const z = interpolatedZ({ x, y }, points, props.options);
      if (!isUndefined(z)) { data.push({ x, y, z }); }
    }));
  localStorage.setItem(Key.data, JSON.stringify(data));
  localStorage.setItem(Key.hash, hash);
};

export const interpolatedZ = (
  position: { x: number, y: number },
  points: (TaggedPoint | TaggedSensorReading)[],
  options: InterpolationOptions,
) => {
  const { useNearest, power } = options;
  const nearest = findNearest(position, points);
  if (!nearest || isUndefined(nearest.body.x) || isUndefined(nearest.body.y)) {
    return undefined;
  }
  if (distance(position, { x: nearest.body.x, y: nearest.body.y }) == 0
    || useNearest) {
    return nearest.kind == "SensorReading" ? nearest.body.value : nearest.body.z;
  }
  const pointObjects = betterCompact(points.map(convertToPointObject));
  return round(
    weightedSum(position, pointObjects, power, true)
    / weightedSum(position, pointObjects, power),
    2);
};

const weightedSum = (
  position: { x: number, y: number },
  points: PointObject[],
  power: number,
  withZ = false,
) =>
  sum(points.map(point =>
    (1 / distance(position, point) ** power)
    * (withZ ? point.value : 1)));

interface InterpolationMapProps {
  kind: "Point" | "SensorReading";
  points: (TaggedGenericPointer | TaggedSensorReading)[];
  mapTransformProps: MapTransformProps;
  getColor(z: number): string;
  options: InterpolationOptions;
}

export const InterpolationMap = (props: InterpolationMapProps) => {
  const step = props.options.stepSize;
  return <g id={"interpolation-map"} style={{ pointerEvents: "none" }}>
    <g id={"map-tiles"} clipPath={"url(#map-grid-clip-path)"}>
      {getInterpolationData(props.kind).map(p => {
        const { x, y, z } = p;
        const { qx, qy } = transformXY(x, y, props.mapTransformProps);
        const { quadrant } = props.mapTransformProps;
        const xOffset = [1, 4].includes(quadrant);
        const yOffset = [3, 4].includes(quadrant);
        return <rect key={`${x}-${y}`}
          x={qx - (xOffset ? step : 0)}
          y={qy - (yOffset ? step : 0)}
          width={step} height={step}
          fill={props.getColor(z)} fillOpacity={0.75} />;
      })}
    </g>
  </g>;
};

interface InterpolationSettingsProps {
  dispatch: Function;
  farmwareEnvs: TaggedFarmwareEnv[];
  saveFarmwareEnv: SaveFarmwareEnv;
}

export enum InterpolationOption {
  stepSize = "interpolation_step_size",
  power = "interpolation_power",
  useNearest = "interpolation_use_nearest",
}

export const InterpolationSettings = (props: InterpolationSettingsProps) => {
  const { dispatch, farmwareEnvs, saveFarmwareEnv } = props;
  const common = { dispatch, farmwareEnvs, saveFarmwareEnv };
  return <div className={"interpolation-settings"}>
    <InterpolationSetting {...common}
      label={t("Interpolation step size")}
      optKey={InterpolationOption.stepSize}
      min={25}
      max={500}
      defaultValue={DEFAULT_INTERPOLATION_OPTIONS.stepSize} />
    <InterpolationSetting {...common}
      label={t("Interpolation weight")}
      optKey={InterpolationOption.power}
      min={2}
      max={32}
      defaultValue={DEFAULT_INTERPOLATION_OPTIONS.power} />
    <InterpolationSetting {...common}
      boolean={true}
      label={t("Interpolation use nearest")}
      optKey={InterpolationOption.useNearest}
      defaultValue={0} />
  </div>;
};

export interface InterpolationSettingProps {
  label: string;
  optKey: string;
  min?: number;
  max?: number;
  boolean?: boolean;
  defaultValue: number;
  farmwareEnvs: TaggedFarmwareEnv[];
  saveFarmwareEnv: SaveFarmwareEnv;
  dispatch: Function;
}

const getOptionValue = (farmwareEnvs: TaggedFarmwareEnv[]) =>
  (key: string, defaultValue: number) => {
    const envValue = farmwareEnvs.filter(farmwareEnv =>
      farmwareEnv.body.key == key)[0]?.body.value;
    return parseInt(envValue ? ("" + envValue) : ("" + defaultValue));
  };

export const InterpolationSetting = (props: InterpolationSettingProps) => {
  const value = getOptionValue(props.farmwareEnvs)(
    props.optKey, props.defaultValue);
  return <div className={"camera-config-number-box"}>
    <label>
      {t(props.label)}
    </label>
    {props.boolean
      ? <ToggleButton
        className={getModifiedClassNameSpecifyDefault(value, props.defaultValue)}
        toggleValue={value}
        toggleAction={() => props.dispatch(props.saveFarmwareEnv(
          props.optKey, value == 1 ? "0" : "1"))} />
      : <BlurableInput type="number"
        className={getModifiedClassNameSpecifyDefault(value, props.defaultValue)}
        value={value}
        min={props.min}
        max={props.max}
        onCommit={e => props.dispatch(props.saveFarmwareEnv(
          props.optKey, e.currentTarget.value))} />}
  </div>;
};
