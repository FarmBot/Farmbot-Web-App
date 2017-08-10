import { Everything } from "../interfaces";
import { Store } from "./interfaces";
import { EnvName } from "./interfaces";
import { all } from "../resources/selectors";

function stopThem() { return "You have unsaved work."; }
function dontStopThem() { }

/** Subscribe to the store. Stop the user from exiting if any part of the
 * state tree contains `dirty: true`. */
export function dontExitIfBrowserIsOnHold(state: Everything) {
  let unsavedWork =
    !!all(state.resources.index).filter(r => r.dirty).length;
  window.onbeforeunload = (unsavedWork) ? stopThem : dontStopThem;
}

interface Subscription {
  fn: (state: Everything) => void;
  env: EnvName;
};

/** To make it easier to manage all things watching the state tree,
 * we keep subscriber functions in this array. */
export let subscriptions: Subscription[] = [
  // {
  //   env: "development",
  //   fn: function storeState(state: Everything) {
  //     sessionStorage["lastState"] = JSON.stringify(state);
  //   }
  // },
  {
    env: "*",
    fn: dontExitIfBrowserIsOnHold
  }
];

export function registerSubscribers(store: Store) {
  let ENV_LIST = [process.env.NODE_ENV, "*"];
  subscriptions.forEach(function (s) {
    if (ENV_LIST.includes(s.env)) {
      store.subscribe(() => s.fn(store.getState()));
    };
  });
};
