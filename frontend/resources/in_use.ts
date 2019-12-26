import { UUID } from "./interfaces";

/** Used for fast lookups of unique UUIDs. */
type UUIDSet = Record<UUID, boolean>;

/** The key side of the Record<UUID, >
 * represents the resource that cannot be deleted (the "in use resource").
 * The value represents a set of resources that make it unsafe to delete the
 * "in use resource". */
export type UsageMap = Record<UUID, UUIDSet>;

/** A directory of all `inUse` data that the frontend cares about. */
export type UsageIndex = Record<UsageKind, UsageMap>;

/** A String denoting relationships the inUse tracker must know about.
 * Format:
 *   1. Name of a resource that cannot be safely deleted.
 *   2. A single period (".")
 *   3. Name of the resource that has a "hold" on the resource listed in (1) */
export type UsageKind =
  | "Regimen.FarmEvent"
  | "Sequence.Regimen"
  | "Sequence.FarmEvent"
  | "Sequence.Sequence"
  | "Sequence.PinBinding"
  | "Sequence.FbosConfig";

/** This variable ensures that `EVERY_USAGE_KIND` does not have typos and is
 * up-to-date all `UsageKind`s */
const values: Record<UsageKind, UsageKind> = {
  "Regimen.FarmEvent": "Regimen.FarmEvent",
  "Sequence.Regimen": "Sequence.Regimen",
  "Sequence.FarmEvent": "Sequence.FarmEvent",
  "Sequence.Sequence": "Sequence.Sequence",
  "Sequence.PinBinding": "Sequence.PinBinding",
  "Sequence.FbosConfig": "Sequence.FbosConfig"
};

/** Array that contains every `UsageKind` token for easy runtime iteration. */
export const EVERY_USAGE_KIND = Object.values(values);

const EMPTY_LOOKUP: Readonly<Record<UUID, boolean>> = {};

/** SCENARIO: You need a lookup table of resources that are *not* safe to
 *            delete.
 *  PROBLEM:  `UsageIndex` is highly nested and cumbersome to traverse. An array
 *            requires iteration (slow) and you need to be able to look up usage
 *            stats quickly for an individual UUID.
 *  SOLUTION: Merge resources into single `Record<T, U>` lookup set.
 *            Use `Object.keys` for iteration if required. */
export const resourceUsageList =
  (usageIndex: UsageIndex): Record<UUID, boolean> => {
    return EVERY_USAGE_KIND
      .map(key => Object.keys(usageIndex[key]))
      .reduce<string[]>((acc, item) => acc.concat(item), [])
      .reduce((acc, item) => ({ ...acc, [item]: true }), EMPTY_LOOKUP);
  };
