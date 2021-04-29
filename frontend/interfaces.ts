import { AuthState } from "./auth/interfaces";
import { ConfigState } from "./config/interfaces";
import { BotState } from "./devices/interfaces";
import { Color as FarmBotJsColor } from "farmbot";
import { DraggableState } from "./draggable/interfaces";
import { RestResources } from "./resources/interfaces";
import { AppState } from "./reducer";

/** Regimens and sequences may have a "color" which determines how it looks
    in the UI. Only certain colors are valid. */
export type ResourceColor = FarmBotJsColor;

export interface Everything {
  config: ConfigState;
  auth: AuthState | undefined;
  dispatch: Function;
  bot: BotState;
  draggable: DraggableState;
  resources: RestResources;
  app: AppState;
}

/** There were a few cases where we handle errors that are legitimately unknown.
 *  In those cases, we can use the `UnsafeError` type instead of `any`, just to
 *  quiet down the linter and to let others know it is inherently unsafe.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnsafeError = any;

export interface TimeSettings {
  utcOffset: number;
  hour24: boolean;
  seconds: boolean;
}
