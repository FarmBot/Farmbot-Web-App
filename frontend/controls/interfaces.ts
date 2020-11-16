import { BotPosition } from "../devices/interfaces";
import { Vector3, McuParams, Xyz, AxisState } from "farmbot";

export interface AxisDisplayGroupProps {
  position: BotPosition;
  label: string;
  firmwareSettings?: McuParams;
  missedSteps?: BotPosition;
  axisStates?: Record<Xyz, AxisState | undefined>;
  busy?: boolean;
  style?: React.CSSProperties;
}

export interface AxisProps {
  val: number | undefined;
  axis: Xyz;
  detectionEnabled: boolean;
  missedSteps: number | undefined;
  axisState: AxisState | undefined;
  busy: boolean | undefined;
  index: number;
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

export interface ToggleButtonProps {
  /** Function that is executed when the toggle button is clicked */
  toggleAction: (e: React.MouseEvent) => void;
  toggleValue: number | string | boolean | undefined;
  disabled?: boolean | undefined;
  customText?: { textFalse: string, textTrue: string };
  dim?: boolean;
  grayscale?: boolean;
  title?: string;
  className?: string;
}
