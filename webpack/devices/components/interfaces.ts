import { BotState, SourceFbosConfig, Xyz, SourceFwConfig, ControlPanelState } from "../interfaces";
import { McuParamName, McuParams } from "farmbot/dist";
import { IntegerSize } from "../../util";
import { FirmwareConfig } from "../../config_storage/firmware_configs";

export interface HomingRowProps {
  hardware: McuParams;
  botDisconnected: boolean;
}

export interface ZeroRowProps {
  botDisconnected: boolean;
}

export interface HomingAndCalibrationProps {
  dispatch: Function;
  bot: BotState;
  sourceFwConfig: SourceFwConfig;
  firmwareConfig: FirmwareConfig | undefined;
  botDisconnected: boolean;
}

export interface BooleanMCUInputGroupProps {
  sourceFwConfig: SourceFwConfig;
  dispatch: Function;
  tooltip?: string | undefined;
  name: string;
  x: McuParamName;
  y: McuParamName;
  z: McuParamName;
  disable?: Record<Xyz, boolean>;
  grayscale?: Record<Xyz, boolean>;
  caution?: boolean | undefined;
  displayAlert?: string | undefined;
}

export interface CalibrationRowProps {
  hardware: McuParams;
  botDisconnected: boolean;
}

export interface NumericMCUInputGroupProps {
  sourceFwConfig: SourceFwConfig;
  dispatch: Function;
  tooltip?: string | undefined;
  name: string;
  x: McuParamName;
  y: McuParamName;
  z: McuParamName;
  intSize?: IntegerSize;
  gray?: Record<Xyz, boolean>;
}

export interface PinGuardMCUInputGroupProps {
  sourceFwConfig: SourceFwConfig;
  dispatch: Function;
  name: string;
  pinNumber: McuParamName;
  timeout: McuParamName;
  activeState: McuParamName;
}

export interface PinGuardProps {
  dispatch: Function;
  controlPanelState: ControlPanelState;
  sourceFwConfig: SourceFwConfig;
}

export interface MotorsProps {
  dispatch: Function;
  firmwareVersion: string | undefined;
  controlPanelState: ControlPanelState;
  sourceFbosConfig: SourceFbosConfig;
  sourceFwConfig: SourceFwConfig;
  isValidFwConfig: boolean;
}

export interface EncodersProps {
  dispatch: Function;
  controlPanelState: ControlPanelState;
  sourceFwConfig: SourceFwConfig;
}

export interface DangerZoneProps {
  dispatch: Function;
  controlPanelState: ControlPanelState;
  onReset(): void;
  botDisconnected: boolean;
}
