import { generateReducer } from "../redux/generate_reducer";
import { Actions } from "../constants";
import { ConnectionState, EdgeStatus } from "./interfaces";
import { computeBestTime } from "./reducer_support";
import { TaggedDevice } from "farmbot";
import { SyncBodyContents } from "../sync/actions";
import { arrayUnwrap } from "../resources/util";
import { startPing, completePing, failPing } from "../devices/connectivity/qos";

export const DEFAULT_STATE: ConnectionState = {
  uptime: {
    "bot.mqtt": undefined,
    "user.mqtt": undefined,
    "user.api": undefined
  },
  pings: {
  }
};

export let connectivityReducer =
  generateReducer<ConnectionState>(DEFAULT_STATE)
    .add<{ id: string }>(Actions.START_QOS_PING, (s, { payload }) => {
      return {
        ...s,
        pings: startPing(s.pings, payload.id)
      };
    })
    .add<EdgeStatus>(Actions.NETWORK_EDGE_CHANGE, (s, { payload }) => {
      s.uptime[payload.name] = payload.status;
      const { qosPingId, status } = payload;
      if (qosPingId) {
        if (status.state == "up") {
          s.pings = completePing(s.pings, qosPingId, status.at);
        } else {
          s.pings = failPing(s.pings, qosPingId);
        }
      }
      return s;
    })
    .add<SyncBodyContents<TaggedDevice>>(Actions.RESOURCE_READY, (s, a) => {
      const d = arrayUnwrap(a.payload.body);
      if (d && d.kind === "Device") {
        s.uptime["bot.mqtt"] = computeBestTime(s.uptime["bot.mqtt"], d && d.body.last_saw_mq);
      }
      return s;
    })
    .add<Actions.RESET_NETWORK>(Actions.RESET_NETWORK, (s, _) => {
      type Keys = (keyof ConnectionState["uptime"])[];
      const keys: Keys = ["bot.mqtt", "user.mqtt", "user.api"];
      keys.map(x => (s.uptime[x] = undefined));
      s.pings = {};

      return s;
    });
