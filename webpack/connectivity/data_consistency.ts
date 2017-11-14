import { getDevice } from "../device";
import { store } from "../redux/store";
import { Actions } from "../constants";

const outstandingRequests: Set<string> = new Set();
(window as any)["outstanding_requests"] = outstandingRequests;

/**
* PROBLEM:  You save a sequence and click "RUN" very fast. The remote device
*           did not have time to download the new sequence and so it crashes
*           with a "sequence not found error".
*
*           This is strictly a frontend consern. We really don't want the FE to
*           serve as a mediator between the device and the end user. It causes
*           all sorts of consistency issues and hard-to-catch errors. This is a
*           local client issue and we want the issue to stay local instead of
*           applying hacks to different parts of the stack.
*
* SOLUTION:
*
*   - When you send an AJAX request, put a UUID onto a heap of "outbound
*     request occurences"
*   - When the request comes back, regardless of the outcome, remove that
*     particular UUID from the heap. ("graveful removal")
*   - If the request takes longer than 5 seconds, remove it from the heap also
*     to prevent accidental lockups. ("forceful removal")
*   - If the outbound heap has `0` records, you can (probably) assume that the
*     Bot, API and client are in a consistent state.
*
* LONG TERM SOLUTION:
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
  console.dir(outstandingRequests);
}
