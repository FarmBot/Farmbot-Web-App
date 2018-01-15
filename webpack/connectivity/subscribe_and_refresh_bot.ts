import { NetworkState, ConnectionStatus } from "./interfaces";
import { Farmbot } from "farmbot";

/** Needing to reproduce the `Everything` interface in tests is tedious.
 * This is a trimmed down version of the state tree that makes testing in
 * isolation more performant / easy to do. */
export interface PartialState {
  bot: { connectivity: { ["bot.mqtt"]: ConnectionStatus | undefined; } }
}

/** PROBLEM: FarmBotJS does not (currently) have a reliable "reconnect"
 *           mechanism. If you get disconnected for a long time, the bot state
 *           will become very stale. This requires some acrobatics on our end.
 *           The code below will detect changes in connectivity and force a
 *           re-fetch of the state tree when going from "up => down" or vice
 *           versa. */
export function generateRefreshTrigger() {
  const lastState: { value: NetworkState } = { value: "down" };
  return (device: Farmbot, state: PartialState) => {
    const connectionStatus = state.bot.connectivity["bot.mqtt"];
    const flag = connectionStatus ? connectionStatus.state : undefined;
    if (device && flag && (flag !== lastState.value)) {
      console.log("WERE DOING THIS!");
      device.readStatus();
      lastState.value = flag;
    } else {
      console.log("nope!");
    }
  };
}
