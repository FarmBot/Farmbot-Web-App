import { SyncStatus } from "farmbot";

/** There are a bunch of ways we need to handle data consistency management
 * depending on a number of factors. */
export enum SyncStrat {
  ONLINE,
  OFFLINE
}

/** "Hints" for figuring out which of the strategies is appropriate. */
interface StratHints {
  /** Not always available if device is offline. */
  fbosVersion?: string;
}

export function determineStrategy(x: StratHints): SyncStrat {
  const { fbosVersion } = x;
  /** Is it even on right now? Don't investigate further if so. */
  if (!fbosVersion) {
    return SyncStrat.OFFLINE;
  }
  return SyncStrat.ONLINE;
}

interface OverrideHints {
  consistent: boolean;
  syncStatus: SyncStatus | undefined;
  fbosVersion: string | undefined;
}

/** Sometimes we can't trust what FBOS tells us. */
export function maybeNegateStatus(x: OverrideHints): SyncStatus | undefined {
  const {
    consistent,
    /** The bot's __CURRENT__ sync status. */
    syncStatus,
    fbosVersion,
  } = x;

  /** No need to override if data is consistent. */
  if (consistent) { return syncStatus; }

  switch (determineStrategy({ fbosVersion })) {
    case SyncStrat.ONLINE:
      return "syncing";
    case SyncStrat.OFFLINE:
      return "unknown";
  }
}
