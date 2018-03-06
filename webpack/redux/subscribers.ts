import { Everything } from "../interfaces";
import { Store } from "./interfaces";
import { EnvName } from "./interfaces";
import { all } from "../resources/selectors";
import { getWebAppConfig } from "../resources/config_selectors";

export function stopThem() { return "You have unsaved work."; }
export function dontStopThem() { }

/** Subscribe to the store. Stop the user from exiting if any part of the
 * state tree contains `dirty` resources. */
export function unsavedCheck(state: Everything) {
  const { index } = state.resources;
  const allOfThem = all(index);
  const dirty = allOfThem.filter(r => !!r.specialStatus);
  const total = dirty.length;
  const doStop = (total !== 0);
  const conf = getWebAppConfig(index);

  if (conf && conf.body.discard_unsaved) {
    window.onbeforeunload = dontStopThem;
  } else {
    window.onbeforeunload = doStop ? stopThem : dontStopThem;
  }
}

export interface Subscription { fn: (state: Everything) => void; env: EnvName; }

/** To make it easier to manage all things watching the state tree,
 * we keep subscriber functions in this array. */
export let subscriptions: Subscription[] = [{ env: "*", fn: unsavedCheck }];

export function registerSubscribers(store: Store) {
  const ENV_LIST = [process.env.NODE_ENV, "*"];
  subscriptions.forEach(function (s) {
    ENV_LIST.includes(s.env) && store.subscribe(() => s.fn(store.getState()));
  });
}
