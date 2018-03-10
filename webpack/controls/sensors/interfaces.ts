import { TaggedSensor } from "../../resources/tagged_resources";
import { Pins } from "farmbot/dist";

export interface SensorState {
  isEditing: boolean;
}

export interface Sensor {
  id?: number;
  pin: number | undefined;
  mode: number;
  label: string;
}

export interface SensorFormProps {
  dispatch: Function;
  sensors: TaggedSensor[];
}

export interface SensorListProps {
  dispatch: Function;
  sensors: TaggedSensor[];
  pins: Pins;
  disabled: boolean | undefined;
}
