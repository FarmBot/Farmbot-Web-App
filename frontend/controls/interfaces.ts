import { BotState, Xyz, BotPosition, ShouldDisplay } from "../devices/interfaces";
import { Vector3, McuParams } from "farmbot/dist";
import {
  TaggedWebcamFeed,
  TaggedPeripheral,
  TaggedSensor,
  TaggedSensorReading
} from "farmbot";
import { NetworkState } from "../connectivity/interfaces";
import { GetWebAppConfigValue } from "../config_storage/actions";

export interface Props {
  dispatch: Function;
  bot: BotState;
  feeds: TaggedWebcamFeed[];
  peripherals: TaggedPeripheral[];
  sensors: TaggedSensor[];
  botToMqttStatus: NetworkState;
  firmwareSettings: McuParams;
  shouldDisplay: ShouldDisplay;
  getWebAppConfigVal: GetWebAppConfigValue;
  sensorReadings: TaggedSensorReading[];
  timeOffset: number;
}

export interface AxisDisplayGroupProps {
  position: BotPosition;
  label: string;
}

export interface AxisInputBoxGroupProps {
  onCommit: (v: Vector3) => void;
  position: BotPosition;
  disabled: boolean | undefined;
}

export interface AxisInputBoxGroupState {
  x?: number | undefined;
  y?: number | undefined;
  z?: number | undefined;
}

export interface AxisInputBoxProps {
  axis: Xyz;
  value: number | undefined;
  onChange: (key: string, val: number | undefined) => void;
}

export interface AxisInputBoxState {
  value: string | undefined;
}

export interface ToggleButtonProps {
  /** Function that is executed when the toggle button is clicked */
  toggleAction: () => void;
  toggleValue: number | string | boolean | undefined;
  disabled?: boolean | undefined;
  customText?: { textFalse: string, textTrue: string };
  dim?: boolean;
  grayscale?: boolean;
  title?: string;
}

export interface WebcamFeed {
  id?: number;
  url: string;
  name: string;
  updated_at?: string;
  created_at?: string;
}

export interface Sensor {
  id?: number;
  pin: number | undefined;
  label: string;
  mode: number;
}

export interface SensorReading {
  id?: number | undefined;
  x: number | undefined;
  y: number | undefined;
  z: number | undefined;
  value: number;
  mode: number;
  pin: number;
  created_at: string;
}
