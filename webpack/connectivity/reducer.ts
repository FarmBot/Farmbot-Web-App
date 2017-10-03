import { generateReducer } from "../redux/generate_reducer";
import { Actions } from "../constants";
import { ConnectionState, EdgeStatus, ConnectionStatus } from "./interfaces";
import { DeviceAccountSettings } from "../devices/interfaces";
import { max, isString } from "lodash";
import * as moment from "moment";

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
        s["bot.mqtt"] = computeBestTime(s["bot.mqtt"], a.payload.data[0]);
      }
      return s;
    });

function computeBestTime(cs: ConnectionStatus | undefined,
  dev: DeviceAccountSettings | undefined,
  now = moment().toDate()): ConnectionStatus | undefined {

  if (dev && isString(dev.last_saw_mq)) {
    const mx = max([now, moment(dev.last_saw_mq).toDate()]);
    return { at: (mx || now).toJSON(), state: (cs && cs.state) || "down" };
  } else {
    // don't bother guessing if info is unavailable
    return cs;
  }
}

interface ResourceReady {
  name: string,
  data: [DeviceAccountSettings];
}
