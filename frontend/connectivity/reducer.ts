import { generateReducer } from "../redux/generate_reducer";
import { Actions } from "../constants";
import { ConnectionState, EdgeStatus } from "./interfaces";
import {
  startPing, completePing, failPing, PingComplete, PingDictionary,
} from "../devices/connectivity/qos";
import { betterCompact } from "../util";

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
      /** Only bring down network status if no more recent pings succeeded. */
      if (!recentPingOk(s.pings, payload.id)) {
        s.uptime["bot.mqtt"] = { state: "down", at: payload.at };
      }
      return s;
    })
    .add<void>(Actions.CLEAR_PINGS, (s) => {
      s.pings = {};
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

/** Check if any more recent pings have succeeded. */
export const recentPingOk = (pings: PingDictionary, id: string): boolean => {
  const failedPingStart = pings[id]?.start;
  const pingValues = betterCompact(Object.values(pings));
  return !!(pingValues.length > 0 && failedPingStart
    && pingValues
      .filter(ping => ping.kind == "complete")
      .map((ping: PingComplete) => ping.start)
      .filter(start => start > failedPingStart).length > 0);
};
