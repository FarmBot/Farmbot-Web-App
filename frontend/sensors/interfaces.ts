import {
  FirmwareHardware, Pins, TaggedPeripheral, TaggedSensor,
} from "farmbot";
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
  peripherals: TaggedPeripheral[];
  pins: Pins;
  disabled: boolean | undefined;
  locked: boolean;
}

export interface SensorsProps {
  bot: BotState;
  sensors: TaggedSensor[];
  peripherals: TaggedPeripheral[];
  dispatch: Function;
  disabled: boolean | undefined;
  firmwareHardware: FirmwareHardware | undefined;
}
