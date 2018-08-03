import { AuthState } from "./auth/interfaces";
import { box } from "boxed_value";
import { BooleanConfigKey, NumberConfigKey } from "./config_storage/web_app_configs";
import { BooleanSetting, NumericSetting } from "./session_keys";
import * as LegacyShim from "./config/legacy_shims";

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

  /** Clear localstorage and sessionstorage. */
  export function clear(): never {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = window.location.origin || "/";
    return undefined as never;
  }

  /** @deprecated Don't use this anymore. This is a legacy articfact of when we
   * used localStorage to store API settings. */
  export function deprecatedGetBool(key: BooleanConfigKey): boolean | undefined {
    return LegacyShim.getBoolViaRedux(key);
  }

  /** Store a boolean value in `localStorage` */
  export function setBool(key: BooleanConfigKey, val: boolean): boolean {
    return LegacyShim.setBoolViaRedux(key, val);
  }

  export function invertBool(key: BooleanConfigKey): boolean {
    return Session.setBool(key, !Session.deprecatedGetBool(key));
  }

  /** Extract numeric settings from `localStorage`. Returns `undefined` when
   * none are found. */
  export function deprecatedGetNum(key: NumberConfigKey): number | undefined {
    return LegacyShim.getNumViaRedux(key);
  }

  /** Set a numeric value in `localStorage`. */
  export function deprecatedSetNum(key: NumberConfigKey, val: number): void {
    LegacyShim.setNumViaRedux(key, val);
  }
}

export const isBooleanSetting =
  // tslint:disable-next-line:no-any
  (x: any): x is BooleanConfigKey => !!BooleanSetting[x as BooleanConfigKey];

export function safeBooleanSettting(name: string): BooleanConfigKey {
  if (isBooleanSetting(name)) {
    return name;
  } else {
    throw new Error(`Expected BooleanConfigKey but got '${name}'`);
  }
}

export const isNumericSetting =
  // tslint:disable-next-line:no-any
  (x: any): x is NumberConfigKey => !!NumericSetting[x as NumberConfigKey];

export function safeNumericSetting(name: string): NumberConfigKey {
  if (isNumericSetting(name)) {
    return name;
  } else {
    throw new Error(`Expected NumberConfigKey but got '${name}'`);
  }
}
