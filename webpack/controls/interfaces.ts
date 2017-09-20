import { BotState, Xyz, BotPosition } from "../devices/interfaces";
import { Vector3 } from "farmbot/dist";
import { RestResources } from "../resources/interfaces";
import {
  TaggedUser,
  TaggedWebcamFeed,
  TaggedPeripheral
} from "../resources/tagged_resources";

export interface Props {
  dispatch: Function;
  bot: BotState;
  feeds: TaggedWebcamFeed[];
  user: TaggedUser | undefined;
  peripherals: TaggedPeripheral[];
  resources: RestResources;
}

export interface MoveProps {
  dispatch: Function;
  bot: BotState;
  user: TaggedUser | undefined;
  disabled: boolean | undefined;
}

export interface DirectionButtonProps {
  axis: Xyz;
  direction: "up" | "down" | "left" | "right";
  isInverted: boolean;
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
  disabled: boolean | undefined;
}

export interface ToggleButtonProps {
  /** Function that is executed when the toggle button is clicked */
  toggleAction: () => void;
  toggleValue: number | string | undefined;
  disabled?: boolean | undefined;
  noYes?: boolean;
}

export interface WebcamFeed {
  id?: number;
  url: string;
  name: string;
  updated_at?: string;
  created_at?: string;
}
