
import { WDENVKey, WD_ENV } from "./interfaces";
import { WD_KEY_DEFAULTS, EVERY_WD_KEY } from "./constants";
import { defensiveClone, betterParseNum } from "../../../util";
import { parseEnvKey } from "./translators";
import { isNumber, isString } from "lodash";
import { UserEnv } from "../../../devices/interfaces";

/** Given a half formed set of weed detector environment variables, creates a
 * fully formed set of environment variables. When a variable is missing, it is
 * replaced with a default value. */
export function prepopulateEnv(env: UserEnv): WD_ENV {
  const output = defensiveClone(WD_KEY_DEFAULTS);
  EVERY_WD_KEY.map(key => {
    const initial = env[key];
    let val: string;
    if (isString(initial)) {
      val = initial;
    } else {
      val = "" + WD_KEY_DEFAULTS[key];
    }
    output[key] = parseEnvKey(key, val);
  });
  return output;
}

/** Given a half-formed set of ENV vars, makes a best effort attempt to find
 * the corresponding value. When lookup fails, provide a sane default value. */
export function envGet(key: WDENVKey, env: Partial<WD_ENV>): number {
  return betterParseNum(
    JSON.stringify(isNumber(env[key]) ? env[key] : ""), WD_KEY_DEFAULTS[key]);
}
