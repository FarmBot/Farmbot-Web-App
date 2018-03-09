import { BotState, SourceFbosConfig, Xyz } from "../interfaces";
import { McuParamName, McuParams } from "farmbot/dist";
import { IntegerSize } from "../../util";

export interface HomingRowProps {
  hardware: McuParams;
}

export interface HomingAndCalibrationProps {
  dispatch: Function;
  bot: BotState;
}

export interface BooleanMCUInputGroupProps {
  bot: BotState;
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
}

export interface NumericMCUInputGroupProps {
  bot: BotState;
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
  bot: BotState;
  dispatch: Function;
  name: string;
  pinNumber: McuParamName;
  timeout: McuParamName;
  activeState: McuParamName;
}

export interface PinGuardProps {
  dispatch: Function;
  bot: BotState;
}

export interface MotorsProps {
  dispatch: Function;
  bot: BotState;
  sourceFbosConfig: SourceFbosConfig;
}

export interface EncodersProps {
  dispatch: Function;
  bot: BotState;
}

export interface DangerZoneProps {
  dispatch: Function;
  bot: BotState;
  onReset(): void;
}
