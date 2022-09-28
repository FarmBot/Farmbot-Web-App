import {
  BotState, SourceFwConfig, Axis, SourceFbosConfig,
} from "../../devices/interfaces";
import { McuParamName, McuParams, FirmwareHardware, Xyz } from "farmbot";
import { IntegerSize } from "../../util";
import { FirmwareConfig } from "farmbot/dist/resources/configs/firmware";
import { ResourceIndex } from "../../resources/interfaces";
import { DeviceSetting } from "../../constants";
import { GetWebAppConfigValue } from "../../config_storage/actions";
import { SettingsPanelState } from "../../interfaces";

export interface AxisSettingsProps {
  dispatch: Function;
  bot: BotState;
  settingsPanelState: SettingsPanelState;
  sourceFwConfig: SourceFwConfig;
  sourceFbosConfig: SourceFbosConfig;
  firmwareConfig: FirmwareConfig | undefined;
  botOnline: boolean;
  firmwareHardware: FirmwareHardware | undefined;
  showAdvanced: boolean;
}

export interface BooleanMCUInputGroupProps {
  sourceFwConfig: SourceFwConfig;
  firmwareHardware: FirmwareHardware | undefined;
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
  disabled?: boolean;
  disabledBy?: string;
  advanced?: boolean;
  showAdvanced?: boolean;
}

export interface CalibrationRowProps {
  type: "find_home" | "calibrate" | "zero";
  mcuParams: McuParams;
  arduinoBusy: boolean;
  locked?: boolean;
  botOnline: boolean;
  action(axis: Axis): void;
  toolTip: string;
  title: DeviceSetting;
  axisTitle: string;
  stallUseDisabled?: boolean;
}

export interface McuInputBoxProps {
  sourceFwConfig: SourceFwConfig;
  setting: McuParamName;
  dispatch: Function;
  intSize?: IntegerSize;
  float?: boolean;
  scale?: number;
  filter?: number;
  gray?: boolean;
  min?: number;
  max?: number;
  disabled?: boolean;
  title?: string;
  firmwareHardware: FirmwareHardware | undefined;
  warnMin?: number;
  warning?: string;
}

export interface NumericMCUInputGroupProps {
  sourceFwConfig: SourceFwConfig;
  firmwareHardware: FirmwareHardware | undefined;
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
  min?: number;
  max?: number;
  disabled?: boolean;
  disabledBy?: string;
  advanced?: boolean;
  showAdvanced?: boolean;
  warnMin?: Record<Xyz, number>;
  warning?: Record<Xyz, string | undefined>;
}

export interface PinGuardMCUInputGroupProps {
  sourceFwConfig: SourceFwConfig;
  firmwareHardware: FirmwareHardware | undefined;
  dispatch: Function;
  label: DeviceSetting;
  pinNumKey: McuParamName;
  timeoutKey: McuParamName;
  activeStateKey: McuParamName;
  resources: ResourceIndex;
  disabled: boolean;
}

export interface PinReportingMCUInputGroupProps {
  sourceFwConfig: SourceFwConfig;
  firmwareHardware: FirmwareHardware | undefined;
  dispatch: Function;
  label: DeviceSetting;
  pinNumKey: McuParamName;
  resources: ResourceIndex;
  disabled: boolean;
}

export interface PinGuardProps {
  dispatch: Function;
  settingsPanelState: SettingsPanelState;
  sourceFwConfig: SourceFwConfig;
  firmwareHardware: FirmwareHardware | undefined;
  resources: ResourceIndex;
  arduinoBusy: boolean;
}

export interface PinReportingProps {
  dispatch: Function;
  settingsPanelState: SettingsPanelState;
  sourceFwConfig: SourceFwConfig;
  firmwareHardware: FirmwareHardware | undefined;
  resources: ResourceIndex;
  arduinoBusy: boolean;
}

export interface MotorsProps {
  dispatch: Function;
  settingsPanelState: SettingsPanelState;
  sourceFwConfig: SourceFwConfig;
  firmwareHardware: FirmwareHardware | undefined;
  arduinoBusy: boolean;
  showAdvanced: boolean;
}

export interface EncodersOrStallDetectionProps {
  dispatch: Function;
  settingsPanelState: SettingsPanelState;
  sourceFwConfig: SourceFwConfig;
  firmwareHardware: FirmwareHardware | undefined;
  arduinoBusy: boolean;
  showAdvanced: boolean;
}

export interface LimitSwitchesProps {
  dispatch: Function;
  settingsPanelState: SettingsPanelState;
  sourceFwConfig: SourceFwConfig;
  firmwareHardware: FirmwareHardware | undefined;
  arduinoBusy: boolean;
  showAdvanced: boolean;
}

export interface ErrorHandlingProps {
  dispatch: Function;
  settingsPanelState: SettingsPanelState;
  sourceFwConfig: SourceFwConfig;
  firmwareHardware: FirmwareHardware | undefined;
  arduinoBusy: boolean;
  showAdvanced: boolean;
}

export interface ParameterManagementProps {
  dispatch: Function;
  settingsPanelState: SettingsPanelState;
  onReset(): void;
  sourceFwConfig: SourceFwConfig;
  firmwareConfig: FirmwareConfig | undefined;
  firmwareHardware: FirmwareHardware | undefined;
  getConfigValue: GetWebAppConfigValue;
  botOnline: boolean;
  arduinoBusy: boolean;
  showAdvanced: boolean;
}

export interface ShowAdvancedToggleProps {
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
}
