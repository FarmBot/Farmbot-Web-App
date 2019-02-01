import { AuthState } from "./auth/interfaces";
import { box } from "boxed_value";
import { BooleanSetting, NumericSetting } from "./session_keys";
import { BooleanConfigKey, NumberConfigKey } from "farmbot/dist/resources/configs/web_app";

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
    localStorage.setItem(KEY, JSON.stringify(nextState));
  }

  /** Fetch the previous session. */
  export function fetchStoredToken(): AuthState | undefined {
    try {
      const v: AuthState = JSON.parse(localStorage.getItem(KEY) || "");
      if (box(v).kind === "object") {
        return v;
      } else {
        throw new Error("Expected object or undefined"); // unreachable?
      }
    } catch (error) {
      return undefined;
    }
  }

  /** Clear localStorage and sessionStorage. */
  export function clear(): never {
    // localStorage.clear();
    // sessionStorage.clear();
    // location.assign(window.location.origin || "/");
    // return undefined as never;
    throw new Error("Boop!");
  }
}

export const isBooleanSetting =
  (k: unknown): k is BooleanConfigKey => !!BooleanSetting[k as BooleanConfigKey];

export function safeBooleanSetting(name: string): BooleanConfigKey {
  if (isBooleanSetting(name)) {
    return name;
  } else {
    throw new Error(`Expected BooleanConfigKey but got '${name}'`);
  }
}

export const isNumericSetting =
  (x: unknown): x is NumberConfigKey => !!NumericSetting[x as NumberConfigKey];

export function safeNumericSetting(name: string): NumberConfigKey {
  if (isNumericSetting(name)) {
    return name;
  } else {
    throw new Error(`Expected NumberConfigKey but got '${name}'`);
  }
}
