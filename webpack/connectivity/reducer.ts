import { generateReducer } from "../redux/generate_reducer";
import { Actions } from "../constants";
import { ConnectionState, EdgeStatus, ResourceReady } from "./interfaces";
import { computeBestTime } from "./reducer_support";

export const DEFAULT_STATE: ConnectionState = {
  "bot.mqtt": undefined,
  "user.mqtt": undefined,
  "user.api": undefined,
};

export let connectivityReducer =
  generateReducer<ConnectionState>(DEFAULT_STATE)
    .add<EdgeStatus>(Actions.NETWORK_EDGE_CHANGE, (s, { payload }) => {
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
    });
