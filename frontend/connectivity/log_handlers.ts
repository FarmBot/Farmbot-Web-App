import { isLog } from "../devices/actions";
import {
  actOnChannelName,
  showLogOnScreen,
  speakLogAloud,
  initLog,
} from "./connect_device";
import { GetState } from "../redux/interfaces";
import { Log } from "farmbot/dist/resources/api_resources";
import { globalQueue } from "./batch_queue";

export const onLogs =
  (_dispatch: Function, getState: GetState) => (msg: Log) => {
    if (isLog(msg)) {
      !msg.type && (msg.type = "info");
      actOnChannelName(msg, "toast", showLogOnScreen);
      actOnChannelName(msg, "espeak", speakLogAloud(getState));
      const log = initLog(msg).payload;
      if (log.kind == "Log") {
        globalQueue.push(log);
        return log;
      }
    }
  };
