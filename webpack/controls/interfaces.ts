import { BotState, Xyz, BotPosition, ShouldDisplay } from "../devices/interfaces";
import { Vector3, McuParams } from "farmbot/dist";
import {
  TaggedUser,
  TaggedWebcamFeed,
  TaggedPeripheral,
  TaggedSensor,
  TaggedSensorReading
} from "../resources/tagged_resources";
import { NetworkState } from "../connectivity/interfaces";
import { GetWebAppConfigValue } from "../config_storage/actions";

export interface Props {
  dispatch: Function;
  bot: BotState;
  feeds: TaggedWebcamFeed[];
  user: TaggedUser | undefined;
  peripherals: TaggedPeripheral[];
  sensors: TaggedSensor[];
  botToMqttStatus: NetworkState;
  firmwareSettings: McuParams;
  shouldDisplay: ShouldDisplay;
  getWebAppConfigVal: GetWebAppConfigValue;
  sensorReadings: TaggedSensorReading[];
  timeOffset: number;
}

export type Vector = Vector3;

export interface AxisDisplayGroupProps {
  position: BotPosition;
  label: string;
}

export interface AxisInputBoxGroupProps {
  onCommit: (v: Vector) => void;
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
}

export interface WebcamFeed {
  id?: number;
  url: string;
  name: string;
  updated_at?: string;
  created_at?: string;
}
