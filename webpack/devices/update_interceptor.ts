import { ConfigKey } from "./actions";
import { McuParams } from "farmbot/dist";

/** HISTORICAL CONTEXT: I hope to eventually delete this file entirely.
 *   The best way to handle these validations would be by storing it
 *   server side and handling things from there. For now, I will perform data
 *   validations on the frontend. Lets try to keep as much of the functionality
 *   in this file and focus on ease of deletion.
 */

/** Determines if it is safe to update a key/value pair, given the current
 * MCU state object. */
type Validation = (key: ConfigKey, val: number, state: McuParams) => boolean;
/** A lookup dictionary for finding edge cases that require special validation
 * rules. If no entry is found, no validation is required. */
type EdgeCaseList = Partial<Record<ConfigKey, Validation>>;

/** Builds a function that compares a key/value update pair against a current
 * MCU value. */
export const greaterThan =
  (compareAgainst: ConfigKey) =>
    (key: ConfigKey, val: number, state: McuParams) => {
      const right = state[compareAgainst] || 0;
      const left = val;
      return (left > right);
    };

/** Builds a function that compares a key/value update pair against a current
 * MCU value. */
export const lessThan =
  (compareAgainst: ConfigKey) =>
    (key: ConfigKey, val: number, state: McuParams) => {
      const right = state[compareAgainst] || 0;
      const left = val;
      return (left < right);
    };

const edgeCases: EdgeCaseList = {
  movement_max_spd_x: greaterThan("movement_min_spd_x"),
  movement_max_spd_y: greaterThan("movement_min_spd_y"),
  movement_max_spd_z: greaterThan("movement_min_spd_z"),
  movement_min_spd_x: lessThan("movement_max_spd_x"),
  movement_min_spd_y: lessThan("movement_max_spd_y"),
  movement_min_spd_z: lessThan("movement_max_spd_z"),
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
    (ok: Function, no?: Function) => {
      const validator = edgeCases[key];
      const isValid = validator ? validator(key, val, state) : true;
      (isValid) ? ok() : (no && no());
    };
