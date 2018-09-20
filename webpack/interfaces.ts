import { AuthState } from "./auth/interfaces";
import { ConfigState } from "./config/interfaces";
import { BotState } from "./devices/interfaces";
import { Color as FarmBotJsColor } from "farmbot";
import { Point } from "farmbot/dist/resources/api_resources";
import { DraggableState } from "./draggable/interfaces";
import { PeripheralState } from "./controls/peripherals/interfaces";
import { RestResources } from "./resources/interfaces";
import { RouterState } from "./experimental/reducer";

/** Regimens and sequences may have a "color" which determines how it looks
    in the UI. Only certain colors are valid. */
export type Color = FarmBotJsColor;

export interface Sensor {
  id?: number;
  pin: number | undefined;
  label: string;
  mode: number;
}

export interface SensorReading {
  id?: number | undefined;
  x: number | undefined;
  y: number | undefined;
  z: number | undefined;
  value: number;
  mode: number;
  pin: number;
  created_at: string;
}

export interface FarmwareEnv {
  id?: number;
  key: string;
  value: string | number | boolean;
}

export interface Everything {
  config: ConfigState;
  auth: AuthState | undefined;
  dispatch: Function;
  bot: BotState;
  draggable: DraggableState;
  Peripheral: PeripheralState;
  resources: RestResources;
  route: RouterState;
}

/** There were a few cases where we handle errors that are legitimately unknown.
 *  In those cases, we can use the `UnsafeError` type instead of `any`, just to
 *  quiet down the linter and to let others know it is inherently unsafe.
 */
// tslint:disable-next-line:no-any
export type UnsafeError = any;

export type PointerTypeName = Point["pointer_type"];
