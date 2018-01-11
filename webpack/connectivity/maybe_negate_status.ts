import { semverCompare, SemverResult } from "../util";
import { SyncStatus } from "farmbot";

/** There are a bunch of ways we need to handle data consistency management
 * depending on a number of factors. */
export enum SyncStrat {
  /** Auto sync is enabled by user. */
  AUTO,
  /** Auto sync is not enabled by user*/
  MANUAL,
  /** Device does not support auto_sync in any way. */
  LEGACY,
  /** Not enough info to say. */
  OFFLINE
}

/** Highest version lacking auto sync. Remove in April 2018 -RC */
const TOO_OLD = "5.0.6";

/** "Hints" for figuring out which of the 4 strategies is appropriate. */
interface StratHints {
  /** Not always available if device is offline. */
  fbosVersion?: string;
  autoSync: boolean;
}

export function determineStrategy(x: StratHints): SyncStrat {
  const { fbosVersion, autoSync } = x;
  /** First pass: Is it even on right now? Don't investigate further if so. */
  if (!fbosVersion) {
    return SyncStrat.OFFLINE;
  }

  /** Second pass: Is it an old version? */
  if (semverCompare(TOO_OLD, fbosVersion) !== SemverResult.RIGHT_IS_GREATER) {
    return SyncStrat.LEGACY;
  }

  /** Third pass: Is auto_sync enabled? */
  const strat = autoSync ? "AUTO" : "MANUAL";
  return SyncStrat[strat];
}

export interface OverrideHints {
  consistent: boolean;
  syncStatus: SyncStatus | undefined;
  fbosVersion: string | undefined;
  autoSync: boolean;
}

/** Sometimes we can't trust what FBOS tells us. */
export function maybeNegateStatus(x: OverrideHints): SyncStatus | undefined {
  const {
    consistent,
    /** The bot's __CURRENT__ sync status. */
    syncStatus,
    fbosVersion,
    autoSync
  } = x;

  /** No need to override if data is consistent. */
  if (consistent) { return syncStatus; }

  switch (determineStrategy({ autoSync, fbosVersion })) {
    case SyncStrat.AUTO:
      return "syncing";
    case SyncStrat.LEGACY:
    case SyncStrat.MANUAL:
      return "sync_now";
    case SyncStrat.OFFLINE:
      return "unknown";
  }
}

/** Legacy bots dont have enough info to unset their `consistency` flag.
 * TODO: Delete this method in April 2018.
 */
export function maybeNegateConsistency(x: OverrideHints): boolean {
  const { autoSync, fbosVersion, consistent, syncStatus } = x;
  switch (determineStrategy({ autoSync, fbosVersion })) {
    case SyncStrat.LEGACY:
      // Manually flip `consistent` off when bot sends `syncing` msg.
      // All others can be handled as usual.
      return (syncStatus === "syncing") ? true : consistent;
    default:
      return consistent;
  }
}
