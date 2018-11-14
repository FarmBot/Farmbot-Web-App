import { UUID } from "./interfaces";

export type UsageKind =
  | "FarmEvent.Regimen"
  | "FarmEvent.Sequence"
  | "Regimen.Sequence"
  | "Sequence.Sequence";

export const USAGE_KINDS: UsageKind[] = [
  "FarmEvent.Regimen",
  "FarmEvent.Sequence",
  "Regimen.Sequence",
  "Sequence.Sequence"
];

export type UsageMap = Record<UUID, UUID>;
export type UsageIndex = Record<UsageKind, UsageMap>;

const start: Record<UUID, boolean> = {};

export const resourceUsageList =
  (usageIndex: UsageIndex): Record<UUID, boolean> => {
    return USAGE_KINDS
      .map(key => Object.keys(usageIndex[key]))
      .reduce<string[]>((acc, item) => acc.concat(item), [])
      .reduce((acc, item) => ({ ...acc, [item]: true }), start);
  };

/** Pull this variable out when its time
 * to write unit tests for in_use tracker */
export const YOU_MUST_FIX_THIS: UsageIndex = {
  "FarmEvent.Regimen": {},
  "FarmEvent.Sequence": {},
  "Regimen.Sequence": {},
  "Sequence.Sequence": {},
};
