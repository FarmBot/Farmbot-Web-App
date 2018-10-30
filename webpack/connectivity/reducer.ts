import { generateReducer } from "../redux/generate_reducer";
import { Actions } from "../constants";
import { ConnectionState, EdgeStatus } from "./interfaces";
import { computeBestTime } from "./reducer_support";
import { padEnd } from "lodash";
import { TaggedResource } from "farmbot";
import { SyncResponse } from "../sync/actions";

export const DEFAULT_STATE: ConnectionState = {
  "bot.mqtt": undefined,
  "user.mqtt": undefined,
  "user.api": undefined
};

const debugState = { lastLog: "" };

export let connectivityReducer =
  generateReducer<ConnectionState>(DEFAULT_STATE)
    .add<EdgeStatus>(Actions.NETWORK_EDGE_CHANGE, (s, { payload }) => {
      const x = s[payload.name];
      const from = padEnd((x && x.state) || "unknown", 7);
      const to = padEnd(payload.status.state, 5);
      const log = `${from} ➡️ ${to} (${payload.why})`;
      if (debugState.lastLog !== log && payload.name == "bot.mqtt") {
        console.log(log);
        debugState.lastLog = log;
      }
      s[payload.name] = payload.status;
      return s;
    })
    .add<SyncResponse<TaggedResource>["payload"]>(Actions.RESOURCE_READY, (s, a) => {
      const d = a.payload.body[0];
      if (d && a.payload.kind === "Device") {
        s["bot.mqtt"] = computeBestTime(s["bot.mqtt"], d && (d as any).last_saw_mq);
      }
      return s;
    })
    .add<Actions.RESET_NETWORK>(Actions.RESET_NETWORK, (s, _) => {
      type Keys = (keyof ConnectionState)[];
      const keys: Keys = ["bot.mqtt", "user.mqtt", "user.api"];
      keys.map(x => (s[x] = undefined));

      return s;
    });
