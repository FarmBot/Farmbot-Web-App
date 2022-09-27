import { AuthState } from "./auth/interfaces";
import { NumericSetting } from "./session_keys";
import { NumberConfigKey } from "farmbot/dist/resources/configs/web_app";

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
      if (typeof v === "object" && JSON.stringify(v)[0] === "{") {
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
    localStorage.clear();
    sessionStorage.clear();
    location.assign(window.location.origin || "/");
    return undefined as never;
  }
}

export const isNumericSetting =
  (x: unknown): x is NumberConfigKey => !!NumericSetting[x as NumberConfigKey];

export function safeNumericSetting(settingName: string): NumberConfigKey {
  if (isNumericSetting(settingName)) {
    return settingName;
  } else {
    throw new Error(`Expected NumberConfigKey but got '${settingName}'`);
  }
}
