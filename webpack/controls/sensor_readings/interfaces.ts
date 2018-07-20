import { TaggedSensorReading, TaggedSensor } from "../../resources/tagged_resources";
import { AxisInputBoxGroupState } from "../interfaces";

export interface SensorReadingsProps {
  sensorReadings: TaggedSensorReading[];
  sensors: TaggedSensor[];
  timeOffset: number;
}

export interface SensorReadingsState {
  sensor: TaggedSensor | undefined;
  timePeriod: number;
  endDate: number;
  location: AxisInputBoxGroupState | undefined;
  showPreviousPeriod: boolean;
  deviation: number;
}

export interface SensorReadingsTableProps {
  readingsForPeriod: (period: "current" | "previous") => TaggedSensorReading[];
  sensors: TaggedSensor[];
  timeOffset: number;
}
