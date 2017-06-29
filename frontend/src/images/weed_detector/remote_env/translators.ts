import * as _ from "lodash";
import { TRANSLATORS, DEFAULT_FORMATTER } from "./constants";
import { WDENVKey } from "./interfaces";

/** Translate values before sending to weed detector. FE => FBOS. */
export function formatEnvKey(key: WDENVKey, value: number) {
  return (TRANSLATORS[key] || DEFAULT_FORMATTER).format(key, value);
}

/** Translate values that came from Weed Detector. FBOS => FE. */
export function parseEnvKey(key: WDENVKey, value: string) {
  return (TRANSLATORS[key] || DEFAULT_FORMATTER)
    .parse(key, value);
}

