import { Pins, TaggedSensor, FirmwareHardware } from "farmbot";
import { BotState } from "../devices/interfaces";

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

export interface SensorsProps {
  bot: BotState;
  sensors: TaggedSensor[];
  dispatch: Function;
  disabled: boolean | undefined;
  firmwareHardware: FirmwareHardware | undefined;
}
