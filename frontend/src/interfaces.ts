import { AuthState } from "./auth/interfaces";
import { ConfigState } from "./config/interfaces";
import { BotState } from "./devices/interfaces";
import { Color as FarmBotJsColor } from "farmbot";
import { DraggableState } from "./draggable/interfaces";
import { PeripheralState } from "./controls/peripherals/interfaces";
import { RestResources } from "./resources/interfaces";

/** Regimens and sequences may have a "color" which determines how it looks
    in the UI. Only certain colors are valid. */
export type Color = FarmBotJsColor;

export interface SelectOptionsParams {
  label: string;
  value: string | number | undefined;
  disabled?: boolean;
  field?: string;
  type?: string;
  x?: number;
  y?: number;
  z?: number;
}

export interface Log {
  id?: number | undefined;
  message: string;
  meta: { type: string; };
  channels: string[];
  created_at: number;
}

interface Location {
  /** EX: /app/designer */
  pathname: string;
  /** EX: ?id=twowing-silverbell&p1=CropInfo */
  search: string;
  hash: string;
  // /** ¯\_(ツ)_/¯ */
  // state: void;
  /** EX: "PUSH" */
  action: string;
  /** EX:  jhedoi */
  key: string;
  /** URL ?Query=string, converted to JS object. */
  query: { [name: string]: string };
}

export interface Everything {
  config: ConfigState;
  auth: AuthState | undefined;
  dispatch: Function;
  bot: BotState;
  location: Location;
  draggable: DraggableState;
  peripherals: PeripheralState;
  resources: RestResources;
  router: {
    push(url?: string): void;
  };
}

/** There were a few cases where we handle errors that are legitimately unknown.
 *  In those cases, we can use the `UnsafeError` type instead of `any`, just to
 *  quiet down the linter and to let others know it is inherently unsafe.
 */
export type UnsafeError = any;

interface BasePoint {
  id?: number | undefined;
  dirty?: boolean | undefined;
  created_at?: string | undefined;
  updated_at?: string | undefined;
  radius: number;
  spread?: number | undefined;
  x: number;
  y: number;
  z: number;
  // device_id: number;
  pointer_id?: number | undefined;
  meta: { [key: string]: (string | undefined) };
  name: string;
}

export interface PlantPointer extends BasePoint {
  openfarm_slug: string;
  pointer_type: "Plant";
}

export interface ToolSlotPointer extends BasePoint {
  tool_id: number | undefined;
  pointer_type: "ToolSlot";
}

export interface GenericPointer extends BasePoint {
  pointer_type: "GenericPointer";
}

export type AnyPointer =
  | GenericPointer
  | ToolSlotPointer
  | PlantPointer;

export type PointerTypeName = AnyPointer["pointer_type"];

export const POINTER_NAMES: Readonly<PointerTypeName>[] = [
  "Plant",
  "GenericPointer",
  "ToolSlot"
];
