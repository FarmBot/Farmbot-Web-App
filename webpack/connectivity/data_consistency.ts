import { getDevice } from "../device";
import { store } from "../redux/store";
import { Actions } from "../constants";
import { semverCompare, SemverResult } from "../util";
import { SyncStatus } from "farmbot";

const outstandingRequests: Set<string> = new Set();
(window as any)["outstanding_requests"] = outstandingRequests;
/** Use this when you need to throw the FE into an inconsistent state, but dont
 * have a real UUID available. It will be removed when a "real" UUID comes
 * along. This is necesary for creating an instantaneous "syncing..." label. */
const PLACEHOLDER = "PLACEHOLDER";
/** Max wait in MS before clearing out.
 * I based this figure off of our highest "problem response time" in production
 * plus an additional 25%. */
const MAX_WAIT = 2000;
/**
* PROBLEM:  You save a sequence and click "RUN" very fast. The remote device
*           did not have time to download the new sequence and so it crashes
*           with a "sequence not found error". This is a result of an
*           inconsistency between the local FE and FBOS.
*
* SOLUTION:
*
*   - On all AJAX requests, the API attaches an `X-Request-Id` header (UUID).
*   - On all auto_sync messages, the API attaches the same UUID under
*     msg.args.label
*   - When FBOS gets an auto_sync message, it replies with an `rpc_ok` message
*     that has the same `label` as the API requeset.
*   - We keep a list of `outstandingRequests` filled with such UUIDs.
*   - When we get an `rpc_ok` from farmbot, we remove it from the list.
*   - If the request takes longer than 5 seconds, remove it from the list also
*     to prevent accidental UX issues. ("forceful removal")
*   - When `outstandingRequests.size === 0`, you can (probably) assume that the
*     Bot, API and client are in a consistent state. It is safe to perform data
*     intensive operations.
*
* LONG TERM SOLUTION: TODO:
*
*   - We should consider moving CRUD operations into FarmBotJS and provide
*     developers a unified API that handles these things.
*   - If data operations were RPCs instead of REST calls, we would not need
*     this and we could track data operations the same way a `exec_sequence`
*     and friends.
*/
export function startTracking(uuid = PLACEHOLDER) {
  store.dispatch({ type: Actions.SET_CONSISTENCY, payload: false });
  outstandingRequests.add(uuid);
  const stop = () => stopTracking(uuid);
  getDevice().on(uuid, stop);
  setTimeout(stop, MAX_WAIT);
}

export function stopTracking(uuid: string) {
  outstandingRequests.delete(uuid);
  outstandingRequests.delete(PLACEHOLDER);
  if (outstandingRequests.size === 0) {
    store.dispatch({ type: Actions.SET_CONSISTENCY, payload: true });
  }
}

/** There are a bunch of ways we need to handle data consistency management
 * depending on a number of factors. */
export enum SyncStrat {
  /** Auto sync is enabled. */
  AUTO,
  /** Auto sync is not enabled */
  MANUAL,
  /** Device does not support auto_sync in any way. */
  LEGACY,
  /** Not enough info to say. */
  OFFLINE
}

/** Highest version lacking auto sync. Remove in January 2018 -RC */
const TOO_OLD = "5.0.6";

interface StratHints {
  fbosVersion?: string;
  autoSync: boolean;
}

export function determineStrategy(x: StratHints): SyncStrat {
  const { fbosVersion, autoSync } = x;
  /** First pass: Is it even on right now? */
  if (!fbosVersion) {
    console.log("Chose 'offline' strategy.");
    return SyncStrat.OFFLINE;
  }

  /** Second pass: Is it an old version? */
  if (semverCompare(TOO_OLD, fbosVersion) !== SemverResult.RIGHT_IS_GREATER) {
    console.log("Chose 'legacy' strategy.");
    return SyncStrat.LEGACY;
  }

  /** Third pass: Is auto_sync enabled? */
  const strat = autoSync ? "AUTO" : "MANUAL";
  console.log(`Chose '${strat}' strategy.`);
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
  const { consistent, syncStatus, fbosVersion, autoSync } = x;

  /** No need to override if data is consistent. */
  if (consistent) {
    return syncStatus;
  }

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
