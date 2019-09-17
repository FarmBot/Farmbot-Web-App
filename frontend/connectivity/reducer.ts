import { generateReducer } from "../redux/generate_reducer";
import { Actions } from "../constants";
import { ConnectionState, EdgeStatus } from "./interfaces";
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
type PingResultPayload = { id: string, at: number };

function maybeTransition(s: ConnectionState, state: "up" | "down", at: number) {
  const stats = s.uptime["bot.mqtt"];
  const go = () => s.uptime["bot.mqtt"] = { state, at };
  if (stats) {
    if (stats.state !== state) {
      go();
    }
  } else {
    go();
  }
}
export let connectivityReducer =
  generateReducer<ConnectionState>(DEFAULT_STATE)
    .add<{ id: string }>(Actions.PING_START, (s, { payload }) => {
      return { ...s, pings: startPing(s.pings, payload.id) };
    })
    .add<PingResultPayload>(Actions.PING_OK, (s, { payload }) => {
      s.pings = completePing(s.pings, payload.id, payload.at);
      maybeTransition(s, "up", payload.at);
      console.log("TODO: Mark `user.mqtt` as up");
      return s;
    })
    .add<PingResultPayload>(Actions.PING_NO, (s, { payload }) => {
      s.pings = failPing(s.pings, payload.id);
      maybeTransition(s, "down", payload.at);
      return s;
    })
    .add<EdgeStatus>(Actions.NETWORK_EDGE_CHANGE, (s, { payload }) => {
      if (payload.name === "bot.mqtt") { // Let the QoS reducer handle this one.
        return s;
      }
      s.uptime[payload.name] = payload.status;
      return s;
    });
