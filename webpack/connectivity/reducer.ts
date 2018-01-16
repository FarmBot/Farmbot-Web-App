import { generateReducer } from "../redux/generate_reducer";
import { Actions } from "../constants";
import { ConnectionState, EdgeStatus, ResourceReady, ConnectionStatus } from "./interfaces";
import { computeBestTime } from "./reducer_support";

export const DEFAULT_STATE: ConnectionState = {
  "bot.mqtt": undefined,
  "user.mqtt": undefined,
  "user.api": undefined
};

const BACKOFF_TIME = 6000;

export let connectivityReducer =
  generateReducer<ConnectionState>(DEFAULT_STATE)
    .add<EdgeStatus>(Actions.NETWORK_EDGE_CHANGE, (s, { payload }) => {
      const now = s[payload.name];
      if (shouldReplace(payload.status, now)) {
        s[payload.name] = payload.status;
        return s;
      } else {
        console.log("Ignoring outdated connectivity report");
        return s;
      }
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
      const later = new Date().getTime();
      keys.map(x => {
        /** FBOS Is constantly sending us pings.
         * Sometimes those pings come in after a "down" message, which leads to
         * "Flickering".
         * Example:
         *                         .- Old Pings Here 👇 --.
         * UP => (click reboot) => UP => UP => UP => UP => DOWN => DOWN
         * To get around this, we use BACKOFF_TIME as a cooldown
         * period to smooth out the flickering.
         */
        const offset = x === "bot.mqtt" ? BACKOFF_TIME : 0;
        s[x] = {
          at: new Date(later + offset).toISOString(),
          state: "down"
        };
      });

      return s;
    });

function shouldReplace(incoming: ConnectionStatus, current?: ConnectionStatus) {
  if (current) {
    const alreadyHave = (new Date(current.at).getTime());
    const possibleReplacement = (new Date(incoming.at).getTime());
    return possibleReplacement > alreadyHave;
  } else {
    return true;
  }
}
