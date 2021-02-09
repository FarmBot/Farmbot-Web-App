import {
  BotLocationData, BotPosition, BotState, ShouldDisplay, UserEnv,
} from "../../devices/interfaces";
import { McuParams, Xyz, FirmwareHardware } from "farmbot";
import { GetWebAppConfigValue } from "../../config_storage/actions";
import { BooleanConfigKey } from "farmbot/dist/resources/configs/web_app";

export type ToggleWebAppBool = (key: BooleanConfigKey) => () => void;
export type GetWebAppBool = (key: BooleanConfigKey) => boolean;

export interface MoveProps {
  dispatch: Function;
  bot: BotState;
  arduinoBusy: boolean;
  firmwareSettings: McuParams;
  getWebAppConfigVal: GetWebAppConfigValue;
  env: UserEnv;
  firmwareHardware: FirmwareHardware | undefined;
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

export interface TakePhotoButtonProps {
  env: UserEnv;
  disabled?: boolean;
}

export interface HomeButtonProps {
  doFindHome: boolean;
  disabled: boolean;
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
}

export interface JogControlsGroupProps extends JogMovementControlsProps {
  dispatch: Function;
}

export type ControlsPopupProps = JogControlsGroupProps;

export interface BotPositionRowsProps {
  locationData: BotLocationData;
  getValue: GetWebAppBool;
  arduinoBusy: boolean;
  firmwareSettings: McuParams;
  firmwareHardware: FirmwareHardware | undefined;
  botOnline: boolean;
  shouldDisplay: ShouldDisplay;
}

export interface AxisActionsProps {
  arduinoBusy: boolean;
  hardwareDisabled: boolean;
  botOnline: boolean;
  axis: Xyz;
  shouldDisplay: ShouldDisplay;
}
