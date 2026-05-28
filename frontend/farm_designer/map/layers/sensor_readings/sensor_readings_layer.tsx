import React from "react";
import {
  TaggedSensorReading, TaggedSensor, TaggedFarmwareEnv,
} from "farmbot";
import { MapTransformProps } from "../../interfaces";
import { GardenSensorReading } from "./garden_sensor_reading";
import { last, round } from "lodash";
import { TimeSettings } from "../../../../interfaces";
import {
  fetchInterpolationOptions, generateData, GetColor, InterpolationMap,
} from "../points/interpolation_map";
import { filterMoistureReadings } from "./filter_moisture_readings";

export { filterMoistureReadings };

export interface SensorReadingsLayerProps {
  visible: boolean;
  overlayVisible: boolean;
  sensorReadings: TaggedSensorReading[];
  mapTransformProps: MapTransformProps;
  timeSettings: TimeSettings;
  sensors: TaggedSensor[];
  farmwareEnvs: TaggedFarmwareEnv[];
}

export function SensorReadingsLayer(props: SensorReadingsLayerProps) {
  const {
    visible, sensorReadings, mapTransformProps, timeSettings, sensors
  } = props;
  const mostRecentSensorReading = last(sensorReadings);
  const options = fetchInterpolationOptions(props.farmwareEnvs);
  const { readings: moistureReadings, sensorNameByPinLookup } =
    filterMoistureReadings(sensorReadings, sensors);
  generateData({
    kind: "SensorReading",
    points: moistureReadings,
    gridSize: mapTransformProps.gridSize,
    getColor: getMoistureColor,
    options,
  });
  return <g id="sensor-readings-layer">
    {mostRecentSensorReading && props.overlayVisible &&
      <InterpolationMap
        kind={"SensorReading"}
        points={moistureReadings}
        getColor={getMoistureColor}
        mapTransformProps={mapTransformProps}
        options={options} />}
    {visible && mostRecentSensorReading &&
      sensorReadings.map(sr =>
        <GardenSensorReading
          key={sr.uuid}
          sensorReading={sr}
          mapTransformProps={mapTransformProps}
          endTime={mostRecentSensorReading.body.created_at}
          timeSettings={timeSettings}
          sensorLookup={sensorNameByPinLookup} />)}
  </g>;
}

export const getMoistureColor: GetColor = (value: number) => {
  const maxValue = 900;
  if (value > maxValue) { return { rgb: "rgb(0, 0, 0)", a: 0 }; }
  const r = 0;
  const g = 0;
  const b = 255;
  const a = round((0.75 * value / maxValue) ** 3, 2);
  return {
    rgb: `rgb(${r}, ${g}, ${b})`,
    a: a,
  };
};
