import { BotState, Xyz, BotPosition } from "../devices/interfaces";
import { Vector3, McuParams } from "farmbot/dist";
import {
  TaggedUser,
  TaggedWebcamFeed,
  TaggedPeripheral
} from "../resources/tagged_resources";
import { NetworkState } from "../connectivity/interfaces";

export interface Props {
  dispatch: Function;
  bot: BotState;
  feeds: TaggedWebcamFeed[];
  user: TaggedUser | undefined;
  peripherals: TaggedPeripheral[];
  botToMqttStatus: NetworkState;
  firmwareSettings: McuParams;
}

export interface MoveProps {
  dispatch: Function;
  bot: BotState;
  user: TaggedUser | undefined;
  disabled: boolean | undefined;
  raw_encoders: boolean;
  scaled_encoders: boolean;
  x_axis_inverted: boolean;
  y_axis_inverted: boolean;
  z_axis_inverted: boolean;
  botToMqttStatus: NetworkState;
  firmwareSettings: McuParams;
}

export interface DirectionButtonProps {
  axis: Xyz;
  direction: "up" | "down" | "left" | "right";
  directionAxisProps: {
    isInverted: boolean;
    stopAtHome: boolean;
    stopAtMax: boolean;
    axisLength: number;
    negativeOnly: boolean;
    position: number | undefined;
  }
  steps: number;
  disabled: boolean | undefined;
}

export interface Payl {
  speed: number;
  x: number;
  y: number;
  z: number;
}

export type Vector = Vector3;

export type EncoderDisplay = "raw_encoders" | "scaled_encoders";

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

export interface StepSizeSelectorProps {
  choices: number[];
  selected: number;
  selector: (num: number) => void;
}

export interface JogMovementControlsProps {
  x_axis_inverted: boolean;
  y_axis_inverted: boolean;
  z_axis_inverted: boolean;
  bot: BotState;
  firmwareSettings: McuParams;
  disabled: boolean | undefined;
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
