import { generateReducer } from "../redux/generate_reducer";
import { Actions } from "../constants";
import { ConnectionState, EdgeStatus, ResourceReady } from "./interfaces";
import { computeBestTime } from "./reducer_support";
import { success } from "farmbot-toastr";

export const DEFAULT_STATE: ConnectionState = {
  "bot.mqtt": undefined,
  "user.mqtt": undefined,
  "user.api": undefined
};

export let connectivityReducer =
  generateReducer<ConnectionState>(DEFAULT_STATE)
    .add<EdgeStatus>(Actions.NETWORK_EDGE_CHANGE, (s, { payload }) => {
      temporaryReconnectIdea(s, payload);
      s[payload.name] = payload.status;
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

export function temporaryReconnectIdea(s: ConnectionState, a: EdgeStatus) {
  /** Emitting side effects in a Reducer is considered bad practice.
   * I was really hoping that this could be handled via the `connect` event
   * in MQTT.js, but for some reason it's not triggering.
   * https://github.com/mqttjs/MQTT.js/issues/743 */
  const x = s["user.mqtt"];
  const wasDown = ((x && x.state) || "down") === "down";
  const isUp = (a.status.state === "up");
  (x && wasDown && isUp)
    && success("Browser is re-connected to the message broker");
}
