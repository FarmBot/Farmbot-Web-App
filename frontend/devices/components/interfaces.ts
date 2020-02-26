import {
  BotState, Xyz, SourceFwConfig,
  ControlPanelState, Axis
} from "../interfaces";
import { McuParamName, McuParams, FirmwareHardware } from "farmbot/dist";
import { IntegerSize } from "../../util";
import { FirmwareConfig } from "farmbot/dist/resources/configs/firmware";
import { ResourceIndex } from "../../resources/interfaces";
import { DeviceSetting } from "../../constants";

export interface ZeroRowProps {
  botDisconnected: boolean;
}

export interface HomingAndCalibrationProps {
  dispatch: Function;
  bot: BotState;
  controlPanelState: ControlPanelState;
  sourceFwConfig: SourceFwConfig;
  firmwareConfig: FirmwareConfig | undefined;
  botDisconnected: boolean;
  firmwareHardware: FirmwareHardware | undefined;
}

export interface BooleanMCUInputGroupProps {
  sourceFwConfig: SourceFwConfig;
  dispatch: Function;
  tooltip: string;
  label: DeviceSetting;
  x: McuParamName;
  y: McuParamName;
  z: McuParamName;
  disable?: Record<Xyz, boolean>;
  grayscale?: Record<Xyz, boolean>;
  caution?: boolean | undefined;
  displayAlert?: string | undefined;
}

export interface CalibrationRowProps {
  type: "find_home" | "calibrate" | "zero";
  hardware: McuParams;
  botDisconnected: boolean;
  action(axis: Axis): void;
  toolTip: string;
  title: DeviceSetting;
  axisTitle: string;
}

export interface NumericMCUInputGroupProps {
  sourceFwConfig: SourceFwConfig;
  dispatch: Function;
  tooltip: string;
  label: DeviceSetting;
  x: McuParamName;
  xScale?: number;
  y: McuParamName;
  yScale?: number;
  z: McuParamName;
  zScale?: number;
  float?: boolean;
  intSize?: IntegerSize;
  gray?: Record<Xyz, boolean>;
}

export interface PinGuardMCUInputGroupProps {
  sourceFwConfig: SourceFwConfig;
  dispatch: Function;
  name: string;
  pinNumKey: McuParamName;
  timeoutKey: McuParamName;
  activeStateKey: McuParamName;
  resources: ResourceIndex;
}

export interface PinGuardProps {
  dispatch: Function;
  controlPanelState: ControlPanelState;
  sourceFwConfig: SourceFwConfig;
  resources: ResourceIndex;
}

export interface MotorsProps {
  dispatch: Function;
  controlPanelState: ControlPanelState;
  sourceFwConfig: SourceFwConfig;
  firmwareHardware: FirmwareHardware | undefined;
}

export interface EncodersProps {
  dispatch: Function;
  controlPanelState: ControlPanelState;
  sourceFwConfig: SourceFwConfig;
  firmwareHardware: FirmwareHardware | undefined;
}

export interface EndStopsProps {
  dispatch: Function;
  controlPanelState: ControlPanelState;
  sourceFwConfig: SourceFwConfig;
}

export interface ErrorHandlingProps {
  dispatch: Function;
  controlPanelState: ControlPanelState;
  sourceFwConfig: SourceFwConfig;
}

export interface PinBindingsProps {
  dispatch: Function;
  controlPanelState: ControlPanelState;
  resources: ResourceIndex;
  firmwareHardware: FirmwareHardware | undefined;
}

export interface DangerZoneProps {
  dispatch: Function;
  controlPanelState: ControlPanelState;
  onReset(): void;
  botDisconnected: boolean;
}
