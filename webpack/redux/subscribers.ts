import { Everything } from "../interfaces";
import { Store } from "./interfaces";
import { EnvName } from "./interfaces";
import { all } from "../resources/selectors";
import { SpecialStatus } from "../resources/tagged_resources";

export function stopThem() { return "You have unsaved work."; }
export function dontStopThem() { }

/** Subscribe to the store. Stop the user from exiting if any part of the
 * state tree contains `dirty` resources. */
export function dontExitIfBrowserIsOnHold(state: Everything) {
  const unsavedWork =
    !!all(state.resources.index)
      .filter(r => r.specialStatus === SpecialStatus.DIRTY)
      .length;
  window.onbeforeunload = (unsavedWork) ? stopThem : dontStopThem;
}

export interface Subscription { fn: (state: Everything) => void; env: EnvName; }

/** To make it easier to manage all things watching the state tree,
 * we keep subscriber functions in this array. */
export let subscriptions: Subscription[] =
  [{ env: "production", fn: dontExitIfBrowserIsOnHold }];

export function registerSubscribers(store: Store) {
  const ENV_LIST = [process.env.NODE_ENV, "*"];
  subscriptions.forEach(function (s) {
    ENV_LIST.includes(s.env) && store.subscribe(() => s.fn(store.getState()));
  });
}
