import { ConfigKey } from "./actions";
import { McuParams } from "farmbot/dist";

/** HISTORICAL CONTEXT: I hope to eventually delete this file entirely.
 *   The best way to handle these validations would be by storing it
 *   server side and handling things from there. For now, I will perform data
 *   validations on the frontend. Lets try to keep as much of the functionality
 *   in this file and focus on ease of deletion.
 *
 *   - RC 30 Aug 17
 */

type Result =
  | { outcome: "OK", errorMessage: undefined }
  | { outcome: "NO", errorMessage: string };
/** Determines if it is safe to update a key/value pair, given the current
 * MCU state object.
 *
 * Returns a string error message on failure. Otherwise returns undefined*/
type Validation =
  (key: ConfigKey, val: number, state: McuParams) => Result;
/** A lookup dictionary for finding edge cases that require special validation
 * rules. If no entry is found, no validation is required. */
type EdgeCaseList = Partial<Record<ConfigKey, Validation>>;
export const OK: Result = { outcome: "OK", errorMessage: undefined };
export const NO =
  (errorMessage: string): Result => ({ outcome: "NO", errorMessage });

export enum McuErrors {
  TOO_HIGH = "Minimum speed should always be lower than maximum",
  TOO_LOW = "Maximum speed should always be higher than maximum",
  DEFAULT = "That is not a valid value"
}

/** Builds a function that compares a key/value update pair against a current
* MCU value. */
export const greaterThan =
  (compareAgainst: ConfigKey, errorMessage = McuErrors.TOO_LOW) =>
    (_key: ConfigKey, val: number, state: McuParams): Result => {
      const minimum = state[compareAgainst] || 0;
      return (val > minimum) ? OK : NO(errorMessage);
    };

/** Builds a function that compares a key/value update pair against a current
 * MCU value. */
export const lessThan =
  (compareAgainst: ConfigKey, errorMessage = McuErrors.TOO_HIGH) =>
    (_key: ConfigKey, val: number, state: McuParams): Result => {
      const minimum = state[compareAgainst] || 0;
      return (val < minimum) ? OK : NO(errorMessage);
    };

/** A lookup dictionary for special cases that need special handling.
 * Eg: `movement_max_spd_x` needs to validate that it is higher than
 *     `movement_min_spd_x`.
 */
const edgeCases: EdgeCaseList = {
  movement_max_spd_x: greaterThan("movement_min_spd_x", McuErrors.TOO_LOW),
  movement_max_spd_y: greaterThan("movement_min_spd_y", McuErrors.TOO_LOW),
  movement_max_spd_z: greaterThan("movement_min_spd_z", McuErrors.TOO_LOW),
  movement_min_spd_x: lessThan("movement_max_spd_x", McuErrors.TOO_HIGH),
  movement_min_spd_y: lessThan("movement_max_spd_y", McuErrors.TOO_HIGH),
  movement_min_spd_z: lessThan("movement_max_spd_z", McuErrors.TOO_HIGH),
};

export const mcuParamValidator =
  /** Given:
   *   - Configuration key (eg: movement_max_spd_x)
   *   - Desired value (eg: 456)
   *   - Current MCU state tree.
   *
   *  Returns: A function that can validate the input against current values.
   *  Use Cases:
   *   - Make sure movement_max_spd_x is greater than movement_min_spd_x
   */
  (key: ConfigKey, val: number, state: Partial<McuParams>) =>
    /** Executes one of two callbacks, based on the results of an
     * MCU validation. */
    (ok: () => void, no?: (message: string) => void): void => {
      const validator = edgeCases[key];
      const result = validator && validator(key, val, state);
      if (result?.outcome === "NO") {
        return (no?.(result.errorMessage));
      } else {
        return ok();
      }
    };
