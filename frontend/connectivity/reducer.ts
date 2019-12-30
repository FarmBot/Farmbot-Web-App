import { generateReducer } from "../redux/generate_reducer";
import { Actions } from "../constants";
import {
  ConnectionState,
  EdgeStatus
} from "./interfaces";
import { startPing, completePing, failPing } from "../devices/connectivity/qos";

export const DEFAULT_STATE: ConnectionState = {
  uptime: {
    "bot.mqtt": undefined,
    "user.mqtt": undefined,
    "user.api": undefined
  },
  pings: {
  },
};
export type PingResultPayload = { id: string, at: number };

export const connectivityReducer =
  generateReducer<ConnectionState>(DEFAULT_STATE)
    .add<{ id: string }>(Actions.PING_START, (s, { payload }) => {
      return { ...s, pings: startPing(s.pings, payload.id) };
    })
    .add<PingResultPayload>(Actions.PING_OK, (s, { payload }) => {
      s.pings = completePing(s.pings, payload.id, payload.at);
      s.uptime["bot.mqtt"] = { state: "up", at: payload.at };
      s.uptime["user.mqtt"] = { state: "up", at: payload.at };

      return s;
    })
    .add<PingResultPayload>(Actions.PING_NO, (s, { payload }) => {
      s.pings = failPing(s.pings, payload.id);
      s.uptime["bot.mqtt"] = { state: "down", at: payload.at };

      return s;
    })
    .add<EdgeStatus>(Actions.NETWORK_EDGE_CHANGE, (s, { payload }) => {
      if (payload.name == "bot.mqtt") {
        return s; // <= Let PING_OK / PING_NO handle it.
      } else {
        s.uptime[payload.name] = payload.status;
        return s;
      }
    });
