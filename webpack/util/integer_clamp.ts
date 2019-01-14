import * as _ from "lodash";
import { parseIntInput } from "./util";

/** The firmware will have an integer overflow if you don't check this one. */
const MAX_SHORT_INPUT = 32000;
const MAX_LONG_INPUT = 2000000000;
const MIN_INPUT = 0;

interface High { outcome: "high"; result: number; }
interface Low { outcome: "low"; result: number; }
interface Malformed { outcome: "malformed"; result: undefined; }
interface Ok { outcome: "ok", result: number; }
type ClampResult = High | Low | Malformed | Ok;

export type IntegerSize = "short" | "long" | undefined;

export const getMaxInputFromIntSize = (size: IntegerSize) => {
  switch (size) {
    case "long":
      return MAX_LONG_INPUT;
    case "short":
    default:
      return MAX_SHORT_INPUT;
  }
};

/** Handle all the possible ways a user could give us bad data or cause an
 * integer overflow in the firmware. */
export function clampUnsignedInteger(
  input: string, size: IntegerSize): ClampResult {
  const result = parseIntInput(input);

  // Clamp to prevent overflow.
  if (_.isNaN(result)) { return { outcome: "malformed", result: undefined }; }
  const max = getMaxInputFromIntSize(size);
  if (result > max) { return { outcome: "high", result: max }; }
  if (result < MIN_INPUT) { return { outcome: "low", result: MIN_INPUT }; }

  return { outcome: "ok", result };
}
