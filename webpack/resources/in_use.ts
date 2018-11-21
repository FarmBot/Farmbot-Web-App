import { UUID } from "./interfaces";

/** List of relationships the inUse tracker must know about. */
export type UsageKind =
  // | "CantBeDeleted.BecuaseThisUsesIt"
  | "Regimen.FarmEvent"
  | "Sequence.Regimen"
  | "Sequence.FarmEvent"
  | "Sequence.Sequence";

/** Same as `type UsageKind` except for iteration and runtime checks. */
export const EVERY_USAGE_KIND: UsageKind[] = [
  "Regimen.FarmEvent",
  "Sequence.Regimen",
  "Sequence.FarmEvent",
  "Sequence.Sequence"
];

export type UsageMap = Record<UUID, Record<UUID, boolean>>;
export type UsageIndex = Record<UsageKind, UsageMap>;

const start: Record<UUID, boolean> = {};

/**
 * SCENARIO: You need a lookup table of which resources are *not* safe to
 *           delete.
 * PROBLEM:  The nested nature of `UsageIndex` makes lookups across all
 *           resource types a bit of a hassle.
 * SOLUTION: Smoosh all resources into one heap. If you need to do iteration,
 *           use `Object.keys();`
 */
export const resourceUsageList =
  (usageIndex: UsageIndex): Record<UUID, boolean> => {
    return EVERY_USAGE_KIND
      .map(key => Object.keys(usageIndex[key]))
      .reduce<string[]>((acc, item) => acc.concat(item), [])
      .reduce((acc, item) => ({ ...acc, [item]: true }), start);
  };
