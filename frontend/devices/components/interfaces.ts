import {
  BotState, Xyz, SourceFwConfig,
  ControlPanelState, ShouldDisplay
} from "../interfaces";
import { McuParamName, McuParams, FirmwareHardware } from "farmbot/dist";
import { IntegerSize } from "../../util";
import { FirmwareConfig } from "farmbot/dist/resources/configs/firmware";
import { ResourceIndex } from "../../resources/interfaces";

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
  firmwareVersion: string | undefined;
  controlPanelState: ControlPanelState;
  sourceFwConfig: SourceFwConfig;
  isValidFwConfig: boolean;
  firmwareHardware: FirmwareHardware | undefined;
}

export interface EncodersProps {
  dispatch: Function;
  shouldDisplay: ShouldDisplay;
  controlPanelState: ControlPanelState;
  sourceFwConfig: SourceFwConfig;
}

export interface DangerZoneProps {
  dispatch: Function;
  controlPanelState: ControlPanelState;
  onReset(): void;
  botDisconnected: boolean;
}
