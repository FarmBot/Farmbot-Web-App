import { BotState, Xyz } from "../devices/interfaces";
import { Vector3 } from "farmbot/dist";
import { TaggedPeripheral, TaggedDevice } from "../resources/tagged_resources";
import { RestResources } from "../resources/interfaces";
import { TaggedUser } from "../resources/tagged_resources";

export interface Props {
  dispatch: Function;
  bot: BotState;
  account: TaggedDevice;
  user: TaggedUser | undefined;
  peripherals: TaggedPeripheral[];
  resources: RestResources;
}

export interface WebcamPanelState {
  isEditing: boolean;
}

export interface DirectionButtonProps {
  axis: Xyz;
  direction: "up" | "down" | "left" | "right";
  isInverted: boolean;
  steps: number;
}

export interface Payl {
  speed: number;
  x: number;
  y: number;
  z: number;
}

export type Vector = Vector3;

export interface AxisInputBoxGroupProps {
  onCommit: (v: Vector) => void;
  bot: BotState;
}

export interface AxisInputBoxGroupState {
  x?: number | undefined;
  y?: number | undefined;
  z?: number | undefined;
}

export interface AxisInputBoxProps {
  axis: Xyz;
  label: string;
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
}

export interface ToggleButtonProps {
  /** Function that is executed when the toggle button is clicked */
  toggleAction: () => void;
  toggleval: number | string | undefined;
  disabled?: boolean | undefined;
}


