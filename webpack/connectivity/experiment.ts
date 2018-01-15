import { NetworkState } from "./interfaces";
import { maybeGetDevice } from "../device";
import { store } from "../redux/store";

/** PROBLEM: FarmBotJS does not (currently) have a reliable "reconnect"
 *           mechanism. If you get disconnected for a long time, the bot state
 *           will become very stale. This requires some acrobatics on our end.
 *           The code below will detect changes in connectivity and force a
 *           re-fetch of the state tree when going from "up => down" or vice
 *           versa. */
const lastState: { value: NetworkState } = { value: "down" };

store.subscribe(() => {
  const device = maybeGetDevice();
  const currentState = store.getState().bot.connectivity["user.mqtt"];
  const state = currentState ? currentState.state : undefined;
  if (device && state && state !== lastState.value) {
    device.readStatus();
    lastState.value = state;
  }
});
