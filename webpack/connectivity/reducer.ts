import { generateReducer } from "../redux/generate_reducer";
import { Actions } from "../constants";
import { ConnectionState, EdgeStatus, ResourceReady, ConnectionStatus } from "./interfaces";
import { computeBestTime } from "./reducer_support";
// import { fancyDebug } from "../util";

export const DEFAULT_STATE: ConnectionState = {
  "bot.mqtt": undefined,
  "user.mqtt": undefined,
  "user.api": undefined
};

export let connectivityReducer =
  generateReducer<ConnectionState>(DEFAULT_STATE)
    .add<EdgeStatus>(Actions.NETWORK_EDGE_CHANGE, (s, { payload }) => {
      s[payload.name] = payload.status;
      const status = s["user.mqtt"];
      if (payload.name === "bot.mqtt" && status) {
        temporaryReconnectIdea(status, payload);
      }
      return s;
    })
    .add<ResourceReady>(Actions.RESOURCE_READY, (s, a) => {
      const isRelevant = a.payload.name === "devices";
      if (isRelevant) {
        const [d] = a.payload.data;
        s["bot.mqtt"] = computeBestTime(s["bot.mqtt"], d && d.last_saw_mq);
      }
      return s;
    })
    .add<Actions.RESET_NETWORK>(Actions.RESET_NETWORK, (s, a) => {
      type Keys = (keyof ConnectionState)[];
      const keys: Keys = ["bot.mqtt", "user.mqtt", "user.api"];
      keys.map(x => (s[x] = undefined));

      return s;
    });

export function temporaryReconnectIdea(x: ConnectionStatus, a: EdgeStatus) {
  /** Emitting side effects in a Reducer is considered bad practice.
   * I was really hoping that this could be handled via the `connect` event
   * in MQTT.js, but for some reason it's not triggering.
   * https://github.com/mqttjs/MQTT.js/issues/743 */
  const wasDown = x.state === "down";
  const isUp = (a.status.state === "up");
  // fancyDebug({ wasDown, isUp });
  if (wasDown && isUp) {
    console.log("TODO: Call fetchStatus()");
  }
}
