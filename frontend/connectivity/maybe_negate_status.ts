import { SyncStatus } from "farmbot";

/** There are a bunch of ways we need to handle data consistency management
 * depending on a number of factors. */
export enum SyncStrat {
  /** Auto sync is enabled by user. */
  AUTO,
  /** Auto sync is not enabled by user*/
  MANUAL,
  /** Not enough info to say. */
  OFFLINE
}

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

  /** Second pass: Is auto_sync enabled? */
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
    case SyncStrat.MANUAL:
      return "sync_now";
    case SyncStrat.OFFLINE:
      return "unknown";
  }
}
