import { NetworkState, ConnectionStatus } from "./interfaces";
import { maybeGetDevice } from "../device";
import { store } from "../redux/store";

/** Needing to reproduce the `Everything` interface in tests is tedious.
 * This is a trimmed down version of the state tree that makes testing in
 * isolation more performant / easy to do. */
interface PartialState {
  bot: { connectivity: { ["user.mqtt"]: ConnectionStatus | undefined; } }
}

interface TrimmedDownStore {
  getState(): PartialState;
  subscribe(cb: () => void): void;
}

/** This function is stateful. */
const lastState: { value: NetworkState } = { value: "down" };

/** PROBLEM: FarmBotJS does not (currently) have a reliable "reconnect"
 *           mechanism. If you get disconnected for a long time, the bot state
 *           will become very stale. This requires some acrobatics on our end.
 *           The code below will detect changes in connectivity and force a
 *           re-fetch of the state tree when going from "up => down" or vice
 *           versa. */
export function startRefetcher(store_: TrimmedDownStore) {
  store_.subscribe(() => {
    const device = maybeGetDevice();
    const currentState = store_.getState().bot.connectivity["user.mqtt"];
    const state = currentState ? currentState.state : undefined;
    if (device && state && state !== lastState.value) {
      device.readStatus();
      lastState.value = state;
    }
  });
}

startRefetcher(store);
