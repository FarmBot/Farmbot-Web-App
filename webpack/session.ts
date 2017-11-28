import { AuthState } from "./auth/interfaces";
import { box } from "boxed_value";
import { get, isNumber, isBoolean } from "lodash";
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
  export function replaceToken(nextState: AuthState) {
    localStorage[KEY] = JSON.stringify(nextState);
  }

  /** Fetch the previous session. */
  export function fetchStoredToken(): AuthState | undefined {
    try {
      const v: AuthState = JSON.parse(localStorage[KEY]);
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
  export function clear(): never {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = window.location.origin || "/";
    return undefined as never;
  }

  /** Fetch a *boolean* value from localstorage. Returns `undefined` when
   * none are found.*/
  export function getBool(key: BooleanSetting): boolean | undefined {
    const output = JSON.parse(localStorage.getItem(key) || "null");
    return (isBoolean(output)) ? output : undefined;
  }

  /** Store a boolean value in `localStorage` */
  export function setBool(key: BooleanSetting, val: boolean): boolean {
    localStorage.setItem(key, JSON.stringify(val));
    return val;
  }

  export function invertBool(key: BooleanSetting): boolean {
    return Session.setBool(key, !Session.getBool(key));
  }

  /** Extract numeric settings from `localStorage`. Returns `undefined` when
   * none are found. */
  export function getNum(key: NumericSetting): number | undefined {
    const output = JSON.parse(get(localStorage, key, "null"));
    return (isNumber(output)) ? output : undefined;
  }

  /** Set a numeric value in `localStorage`. */
  export function setNum(key: NumericSetting, val: number): void {
    localStorage.setItem(key, JSON.stringify(val));
  }
}

const isBooleanSetting =
  // tslint:disable-next-line:no-any
  (x: any): x is BooleanSetting => !!BooleanSetting[x];

export function safeBooleanSettting(name: string): BooleanSetting {
  if (isBooleanSetting(name)) {
    return name;
  } else {
    throw new Error(`Expected BooleanSetting but got '${name}'`);
  }
}
