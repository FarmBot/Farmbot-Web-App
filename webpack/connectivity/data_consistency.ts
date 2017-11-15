import { getDevice } from "../device";
import { store } from "../redux/store";
import { Actions } from "../constants";

const outstandingRequests: Set<string> = new Set();
(window as any)["outstanding_requests"] = outstandingRequests;

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
export function startTracking(uuid: string | undefined) {
  if (uuid) {
    store.dispatch({ type: Actions.SET_CONSISTENCY, payload: false });
    outstandingRequests.add(uuid);
    const stop = () => stopTracking(uuid);
    getDevice().on(uuid, stop);
    setTimeout(stop, 5000);
  }
}

export function stopTracking(uuid: string) {
  outstandingRequests.delete(uuid);
  if (outstandingRequests.size === 0) {
    store.dispatch({ type: Actions.SET_CONSISTENCY, payload: true });
  }
}
