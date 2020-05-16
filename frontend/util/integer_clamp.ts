import { parseIntInput } from "./util";

/** The firmware will have an integer overflow if you don't check this one. */
const MAX_SHORT_INPUT = 32000;
const MAX_LONG_INPUT = 2000000000;
const DEFAULT_MIN = 0;

interface MinMax { min: number, max: number }
interface High extends MinMax { outcome: "high"; result: number; }
interface Low extends MinMax { outcome: "low"; result: number; }
interface Malformed extends MinMax { outcome: "malformed"; result: undefined; }
interface Ok extends MinMax { outcome: "ok", result: number; }
type ClampResult = High | Low | Malformed | Ok;

export type IntegerSize = "short" | "long" | undefined;
type Limits = { min: number | undefined, max: number | undefined };

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
export function clampInteger(
  input: string, size: IntegerSize, limits?: Limits): ClampResult {
  const result = parseIntInput(input);

  // Clamp to prevent overflow.
  const min = Math.max(limits?.min || DEFAULT_MIN, -getMaxInputFromIntSize(size));
  const max = Math.min(limits?.max || Infinity, getMaxInputFromIntSize(size));
  if (isNaN(result)) {
    return { outcome: "malformed", result: undefined, min, max };
  }
  if (result > max) { return { outcome: "high", result: max, min, max }; }
  if (result < min) { return { outcome: "low", result: min, min, max }; }

  return { outcome: "ok", result, min, max };
}
