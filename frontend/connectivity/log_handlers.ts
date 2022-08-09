import { isLog } from "../devices/actions";
import {
  actOnChannelName,
  showLogOnScreen,
  speakLogAloud,
  initLog,
  logBeep,
} from "./connect_device";
import { GetState } from "../redux/interfaces";
import { Log } from "farmbot/dist/resources/api_resources";
import { globalQueue } from "./batch_queue";
import { Actions } from "../constants";
import { round } from "lodash";
import { MovementState } from "../interfaces";
import { BotPosition } from "../devices/interfaces";
import { Xyz } from "farmbot";

export const onLogs =
  (dispatch: Function, getState: GetState) => (msg: Log) => {
    if (isLog(msg)) {
      !msg.type && (msg.type = "info");
      actOnChannelName(msg, "toast", showLogOnScreen);
      actOnChannelName(msg, "espeak", speakLogAloud(getState));
      logBeep(getState)(msg);
      parseMovementLog(msg, dispatch);
      const log = initLog(msg).payload;
      if (log.kind == "Log") {
        globalQueue.push(log);
        return log;
      }
    }
  };

export const parseMovementLog = (log: Log, dispatch: Function) => {
  if (!log.message.startsWith("Moving to (")) { return; }
  const start = { x: log.x, y: log.y, z: log.z };
  const endArray = log.message.split("Moving to (")[1]
    .replace(")", "")
    .split(", ")
    .map(c => parseFloat(c));
  const end = { x: endArray[0], y: endArray[1], z: endArray[2] };
  dispatch(setMovementStateFromPosition(start, end));
};

export const setMovementState = (payload: MovementState) =>
  (dispatch: Function) => {
    dispatch({ type: Actions.START_MOVEMENT, payload });
  };

export const setMovementStateFromPosition = (
  start: BotPosition = { x: undefined, y: undefined, z: undefined },
  end: Record<Xyz, number> = { x: 0, y: 0, z: 0 },
) =>
  (dispatch: Function) => {
    const distance = {
      x: round(end.x - (start.x || 0), 2),
      y: round(end.y - (start.y || 0), 2),
      z: round(end.z - (start.z || 0), 2),
    };
    const payload: MovementState = { start, distance };
    dispatch({ type: Actions.START_MOVEMENT, payload });
  };
