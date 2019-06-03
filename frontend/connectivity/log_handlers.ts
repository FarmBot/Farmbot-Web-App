import { isLog } from "../devices/actions";
import {
  actOnChannelName,
  showLogOnScreen,
  speakLogAloud,
  initLog
} from "./connect_device";
import { GetState } from "../redux/interfaces";
import { dispatchNetworkDown } from ".";
import { Log } from "farmbot/dist/resources/api_resources";
import { globalQueue } from "./batch_queue";
import { isUndefined, get } from "lodash";
import { MessageType } from "../sequences/interfaces";

const LEGACY_META_KEY_NAMES: (keyof Log)[] = [
  "type",
  "x",
  "y",
  "z",
  "verbosity",
  "major_version",
  "minor_version"
];

/** Copy fields from `log.meta` into `log`. */
function legacyKeyTransformation(log: Log, key: keyof Log) {
  /** Attempt to find field in `log`. */
  if (isUndefined(log[key])) {
    /** Attempt to find field in `log.meta`. */
    const metaValue: Log[typeof key] = get(log, ["meta", key], undefined);
    // TODO: Fix this typing (expects `never` instead of `Log[typeof key]`).
    log[key] = metaValue as never;
  }
}

export const onLogs =
  (_dispatch: Function, getState: GetState) => (msg: Log) => {
    if (isLog(msg)) {
      LEGACY_META_KEY_NAMES.map(key => legacyKeyTransformation(msg, key));
      actOnChannelName(msg, "toast", showLogOnScreen);
      actOnChannelName(msg, "espeak", speakLogAloud(getState));
      const log = initLog(msg).payload;
      log.kind == "Log" && globalQueue.push(log);
      // CORRECT SOLUTION: Give each device its own topic for publishing
      //                   MQTT last will message.
      // FAST SOLUTION:    We would need to re-publish FBJS and FBOS to
      //                   change topic structure. Instead, we will use
      //                   inband signalling (for now).
      // TODO:             Make a `bot/device_123/offline` channel.
      const died =
        msg.message.includes("is offline") && msg.type === MessageType.error;
      died && dispatchNetworkDown("bot.mqtt", undefined, "Got offline message");
    }
  };
