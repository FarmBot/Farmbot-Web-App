import { NetworkState, ConnectionStatus } from "./interfaces";
import { maybeGetDevice } from "../device";
import { Store } from "redux";
import { fancyDebug } from "../util";
import { Farmbot } from "farmbot";

/** Needing to reproduce the `Everything` interface in tests is tedious.
 * This is a trimmed down version of the state tree that makes testing in
 * isolation more performant / easy to do. */
export interface PartialState {
  bot: { connectivity: { ["user.mqtt"]: ConnectionStatus | undefined; } }
}

/** PROBLEM: FarmBotJS does not (currently) have a reliable "reconnect"
 *           mechanism. If you get disconnected for a long time, the bot state
 *           will become very stale. This requires some acrobatics on our end.
 *           The code below will detect changes in connectivity and force a
 *           re-fetch of the state tree when going from "up => down" or vice
 *           versa. */
export function subscribeAndRefreshBot() {
  const lastState: { value: NetworkState } = { value: "down" };
  return (storeState: PartialState, device: Farmbot) => {
    const currentState = storeState.bot.connectivity["user.mqtt"];
    const state = currentState ? currentState.state : undefined;
    if (device && state && state !== lastState.value) {
      fancyDebug({ current: state, previous: lastState.value });
      device.readStatus();
      lastState.value = state;
    }
  };
}
