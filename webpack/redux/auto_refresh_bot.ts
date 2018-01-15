import { getDevice } from "../device";
import { Subscription } from "./subscribers";

/** Need to compare last state to current state. Stash old state here: */
const mqttHistory = { last: { state: "down", at: (new Date()).toISOString() } };

export const autoRefreshBot: Subscription = {
  env: "*",
  fn: (s) => {
    const x = s.bot.connectivity["bot.mqtt"];
    const wasDown = mqttHistory.last.state === "down";
    if (x && wasDown && x.state === "up") {
      mqttHistory.last = x;
      getDevice().readStatus().then(() => { }, () => { });
    }
  }
};
