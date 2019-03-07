import { BotPosition, BotState } from "../../devices/interfaces";
import { McuParams, Xyz } from "farmbot";
import { NetworkState } from "../../connectivity/interfaces";
import { GetWebAppConfigValue } from "../../config_storage/actions";
import { BooleanConfigKey } from "farmbot/dist/resources/configs/web_app";

export type ToggleWebAppBool = (key: BooleanConfigKey) => () => void;
export type GetWebAppBool = (key: BooleanConfigKey) => boolean;

export interface MoveProps {
  dispatch: Function;
  bot: BotState;
  arduinoBusy: boolean;
  botToMqttStatus: NetworkState;
  firmwareSettings: McuParams;
  getWebAppConfigVal: GetWebAppConfigValue;
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

export interface Payl {
  speed: number;
  x: number;
  y: number;
  z: number;
}

export interface StepSizeSelectorProps {
  choices: number[];
  selected: number;
  selector: (num: number) => void;
}

export interface DirectionAxesProps {
  axisInversion: Record<Xyz, boolean>;
  botPosition: BotPosition;
  firmwareSettings: McuParams;
}

interface JogMovementControlsBaseProps extends DirectionAxesProps {
  stepSize: number;
  arduinoBusy: boolean;
  xySwap: boolean;
}

export interface JogMovementControlsProps extends JogMovementControlsBaseProps {
  doFindHome: boolean;
}

export interface ControlsPopupProps extends JogMovementControlsBaseProps {
  dispatch: Function;
}
