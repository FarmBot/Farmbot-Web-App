import { TaggedSensor } from "farmbot";
import { Pins } from "farmbot/dist";

export interface SensorState {
  isEditing: boolean;
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
