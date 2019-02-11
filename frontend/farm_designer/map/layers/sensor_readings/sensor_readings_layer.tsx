import * as React from "react";
import { TaggedSensorReading, TaggedSensor } from "farmbot";
import { MapTransformProps } from "../../interfaces";
import { GardenSensorReading } from "./garden_sensor_reading";
import { last } from "lodash";

export interface SensorReadingsLayerProps {
  visible: boolean;
  sensorReadings: TaggedSensorReading[];
  mapTransformProps: MapTransformProps;
  timeOffset: number;
  sensors: TaggedSensor[];
}

export function SensorReadingsLayer(props: SensorReadingsLayerProps) {
  const {
    visible, sensorReadings, mapTransformProps, timeOffset, sensors
  } = props;
  const mostRecentSensorReading = last(sensorReadings);
  const sensorNameByPinLookup: { [x: number]: string } = {};
  sensors.map(x => { sensorNameByPinLookup[x.body.pin || 0] = x.body.label; });
  return <g id="sensor-readings-layer">
    {visible && mostRecentSensorReading &&
      sensorReadings.map(sr =>
        <GardenSensorReading
          key={sr.uuid}
          sensorReading={sr}
          mapTransformProps={mapTransformProps}
          endTime={mostRecentSensorReading.body.created_at}
          timeOffset={timeOffset}
          sensorLookup={sensorNameByPinLookup} />)}
  </g>;
}
