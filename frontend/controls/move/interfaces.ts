import {
  BotLocationData, BotPosition, BotState, SourceFwConfig, UserEnv,
} from "../../devices/interfaces";
import { McuParams, Xyz, FirmwareHardware, JobProgress, TaggedLog } from "farmbot";
import { GetWebAppConfigValue } from "../../config_storage/actions";
import { MovementState } from "../../interfaces";

export interface MoveProps {
  dispatch: Function;
  bot: BotState;
  arduinoBusy: boolean;
  firmwareSettings: McuParams;
  getWebAppConfigVal: GetWebAppConfigValue;
  env: UserEnv;
  firmwareHardware: FirmwareHardware | undefined;
}

export type ButtonDirection = "up" | "down" | "left" | "right";

export interface DirectionButtonProps {
  axis: Xyz;
  direction: ButtonDirection;
  directionAxisProps: {
    isInverted: boolean;
    stopAtHome: boolean;
    stopAtMax: boolean;
    axisLength: number;
    negativeOnly: boolean;
    position: number | undefined;
  }
  steps: number;
  arduinoBusy: boolean | undefined;
  botOnline: boolean | undefined;
  locked: boolean;
  botPosition: BotPosition;
  setActivePopover(s: string | undefined): void;
  popover: string | undefined;
  movementState: MovementState;
  dispatch: Function;
}

export interface TakePhotoButtonProps {
  env: UserEnv;
  botOnline: boolean;
  imageJobs: JobProgress[];
  logs: TaggedLog[];
}

export interface HomeButtonProps {
  doFindHome: boolean;
  arduinoBusy: boolean | undefined;
  botOnline: boolean | undefined;
  locked: boolean;
  homeDirection?: number;
  setActivePopover(s: string | undefined): void;
  popover: string | undefined;
  movementState: MovementState;
  botPosition: BotPosition;
  dispatch: Function;
}

export interface StepSizeSelectorProps {
  dispatch: Function;
  selected: number;
}

export interface DirectionAxesProps {
  botPosition: BotPosition;
  firmwareSettings: McuParams;
  getConfigValue: GetWebAppConfigValue;
}

export interface JogMovementControlsProps extends DirectionAxesProps {
  stepSize: number;
  botOnline: boolean;
  env: UserEnv;
  arduinoBusy: boolean;
  locked: boolean;
  highlightAxis?: Xyz;
  highlightDirection?: "both" | "up" | undefined;
  highlightHome?: boolean;
  dispatch: Function;
  movementState: MovementState;
  imageJobs: JobProgress[];
  logs: TaggedLog[];
}

export interface JogControlsGroupProps extends JogMovementControlsProps {
  dispatch: Function;
}

export interface ControlsPopupProps extends JogControlsGroupProps {
  isOpen: boolean;
}

export interface BotPositionRowsProps {
  locationData: BotLocationData;
  getConfigValue: GetWebAppConfigValue;
  arduinoBusy: boolean;
  locked: boolean;
  firmwareSettings: McuParams;
  sourceFwConfig: SourceFwConfig;
  firmwareHardware: FirmwareHardware | undefined;
  botOnline: boolean;
  dispatch: Function;
}

export interface AxisActionsProps {
  arduinoBusy: boolean;
  locked: boolean;
  hardwareDisabled: boolean;
  botOnline: boolean;
  axis: Xyz;
  dispatch: Function;
  botPosition: BotPosition;
  sourceFwConfig: SourceFwConfig;
}

export interface SetAxisLengthProps {
  axis: Xyz;
  dispatch: Function;
  botPosition: BotPosition;
  sourceFwConfig: SourceFwConfig;
}

export interface MoveControlsProps {
  dispatch: Function;
  bot: BotState;
  getConfigValue: GetWebAppConfigValue;
  sourceFwConfig: SourceFwConfig;
  firmwareSettings: McuParams;
  firmwareHardware: FirmwareHardware | undefined;
  env: UserEnv;
  highlightAxis?: Xyz;
  highlightDirection?: "both" | "up" | undefined;
  highlightHome?: boolean;
  movementState: MovementState;
  logs: TaggedLog[];
}
