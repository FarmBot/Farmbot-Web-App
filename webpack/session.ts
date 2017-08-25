import { AuthState } from "./auth/interfaces";
import { box } from "boxed_value";
import { get, isNumber } from "lodash";

export enum BooleanSetting {
  X_AXIS_INVERTED = "x_axis_inverted",
  Y_AXIS_INVERTED = "y_axis_inverted",
  Z_AXIS_INVERTED = "z_axis_inverted",
  RAW_ENCODERS = "raw_encoders",
  SCALED_ENCODERS = "scaled_encoders"
}

export enum NumericSetting {
  BOT_ORIGIN_QUADRANT = "bot_origin_quadrant",
  ZOOM_LEVEL = "zoom_level",
}

export namespace Session {
  const KEY = "session";

  /** Replace the contents of session storage. */
  export function replace(nextState: AuthState) {
    localStorage[KEY] = JSON.stringify(nextState);
  }

  /** Fetch the previous session. */
  export function getAll(): AuthState | undefined {
    try {
      let v: AuthState = JSON.parse(localStorage[KEY]);
      if (box(v).kind === "object") {
        return v;
      } else {
        throw new Error("Expected object or undefined");
      }
    } catch (error) {
      return undefined;
    }
  }

  /** Clear localstorage and sessionstorage. */
  export function clear() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = window.location.origin;
  }

  export function getBool(key: BooleanSetting): boolean {
    let output = JSON.parse(get(localStorage, key, "false"));
    return !output;
  }

  export function setBool(key: BooleanSetting, val: boolean): void {
    localStorage.setItem(key, JSON.stringify(val));
  }

  export function getNum(key: NumericSetting): number | undefined {
    let output = JSON.parse(get(localStorage, key, "null"));
    return (isNumber(output)) ? output : undefined;
  }

  export function setNum(key: NumericSetting, val: number): void {
    localStorage.setItem(key, JSON.stringify(val));
  }
}
