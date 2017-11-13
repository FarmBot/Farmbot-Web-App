import { AxiosRequestConfig } from "axios";
import { store } from "../redux/store";
import { Actions } from "../constants";

const outstandingRequests: Set<AxiosRequestConfig> = new Set();
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
export function startTracking(conf: AxiosRequestConfig) {
  outstandingRequests.add(conf);
  toggleConsistency(false);
  setTimeout(() => {
    stopTracking(conf);
  }, 3000);
}

export function stopTracking(conf: AxiosRequestConfig) {
  outstandingRequests.delete(conf);
  if (outstandingRequests.size < 1) {
    toggleConsistency(true);
  }
}

export const toggleConsistency = (payload: boolean) => {
  const current = store.getState().connectivity.consistent === payload;
  const state = payload ? "consistent" : "inconsistent";
  if (current) {
    console.log(`Already ${state}`);
  } else {
    console.log(`Flipping to ${state} state`);
    store.dispatch({ type: Actions.SET_CONSISTENCY, payload });
  }
};
