import { AuthState } from "./auth/interfaces";
import { box } from "boxed_value";
import { get, isNumber } from "lodash";
import { BooleanSetting, NumericSetting } from "./session_keys";

/** The `Session` namespace is a wrapper for `localStorage`.
 * Use this to avoid direct access of `localStorage` where possible.
 *
 * Problems this namespace aims to solve:
 *   - Avoid duplication of localStorage key names.
 *   - Avoid duplication of de-serialization logic.
 *   - Avoid type errors by explicitly naming keys as (Boolean|Numeric)Setting
 *   - Create an upgrade path for the eventual server side storage
 */
export namespace Session {
  /** Key that holds the user's JWT */
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

  /** Fetch a *boolean* value from localstorage. */
  export function getBool(key: BooleanSetting): boolean {
    return JSON.parse(localStorage.getItem(key) || "false");
  }

  /** Store a boolean value in `localStorage` */
  export function setBool(key: BooleanSetting, val: boolean): void {
    localStorage.setItem(key, JSON.stringify(val));
  }

  /** Extract numeric settings from `localStorage`. Returns `undefined` when
   * none are found. */
  export function getNum(key: NumericSetting): number | undefined {
    let output = JSON.parse(get(localStorage, key, "null"));
    return (isNumber(output)) ? output : undefined;
  }

  /** Set a numeric value in `localStorage`. */
  export function setNum(key: NumericSetting, val: number): void {
    localStorage.setItem(key, JSON.stringify(val));
  }
}
