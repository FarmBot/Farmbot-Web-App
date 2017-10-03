import { generateReducer } from "../redux/generate_reducer";
import { Actions } from "../constants";
import { ConnectionState, EdgeStatus } from "./interfaces";

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
    });
