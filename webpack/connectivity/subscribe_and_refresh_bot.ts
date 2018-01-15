import { NetworkState, ConnectionStatus } from "./interfaces";
import { Farmbot } from "farmbot";
import { fancyDebug } from "../util";

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
  const lastState: { value?: NetworkState } = { value: undefined };
  return (device: Farmbot, state: PartialState) => {
    const connectionStatus = state.bot.connectivity["bot.mqtt"];
    const flag = connectionStatus ? connectionStatus.state : undefined;
    if (flag &&
      (flag === "up") &&
      (lastState.value === "down")) {
      fancyDebug({ connectionStatus, flag, lastState });
      device.readStatus();
      console.log(`Set lastState.value from ${lastState.value} to ${flag}`);
      lastState.value = flag;
    } else {
      console.log("nope!");
    }
  };
}
