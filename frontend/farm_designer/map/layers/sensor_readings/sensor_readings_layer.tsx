import React from "react";
import {
  TaggedSensorReading, TaggedSensor, ANALOG, TaggedFarmwareEnv,
} from "farmbot";
import { MapTransformProps } from "../../interfaces";
import { GardenSensorReading } from "./garden_sensor_reading";
import { last, round } from "lodash";
import { TimeSettings } from "../../../../interfaces";
import {
  fetchInterpolationOptions, generateData, InterpolationMap,
} from "../points/interpolation_map";

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
  const sensorNameByPinLookup: { [x: number]: string } = {};
  sensors.map(x => { sensorNameByPinLookup[x.body.pin || 0] = x.body.label; });
  const options = fetchInterpolationOptions(props.farmwareEnvs);
  const moistureReadings = sensorReadings
    .filter(r =>
      (sensorNameByPinLookup[r.body.pin] || "").toLowerCase().includes("soil")
      && r.body.mode == ANALOG);
  generateData({
    kind: "SensorReading",
    points: moistureReadings, mapTransformProps, getColor: getMoistureColor,
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

const getMoistureColor = (value: number) => {
  const normalizedValue = round(255 * value / 1024);
  if (value > 900) { return "rgb(255, 255, 255)"; }
  return `rgb(0, 0, ${normalizedValue})`;
};
