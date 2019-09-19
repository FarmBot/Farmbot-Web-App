import { Farmbot, uuid } from "farmbot";
import {
  dispatchNetworkDown,
  dispatchNetworkUp,
  dispatchQosStart,
  pingOK,
  pingNO
} from "./index";
import { isNumber } from "lodash";
import axios from "axios";
import { API } from "../api/index";
import { FarmBotInternalConfig } from "farmbot/dist/config";
import { now } from "../devices/connectivity/qos";

export const PING_INTERVAL = 2000;

export const LAST_IN: keyof FarmBotInternalConfig = "LAST_PING_IN";
export const LAST_OUT: keyof FarmBotInternalConfig = "LAST_PING_OUT";
type Direction = "in" | "out";

export function readPing(bot: Farmbot, direction: Direction): number | undefined {
  const val = bot.getConfig(direction === "out" ? LAST_OUT : LAST_IN);
  return isNumber(val) ? val : undefined;
}

export function sendOutboundPing(bot: Farmbot) {
  const id = uuid();

  const x = { done: false };

  const ok = () => {
    if (!x.done) {
      x.done = true;
      pingOK(id, now());
    }
  };

  const no = () => {
    if (!x.done) {
      x.done = true;
      pingNO(id, now());
    }
  };

  dispatchQosStart(id);
  setTimeout(no, PING_INTERVAL + 150);
  bot.ping().then(ok, no);
}

export function startPinging(bot: Farmbot) {
  sendOutboundPing(bot);
  setInterval(() => sendOutboundPing(bot), PING_INTERVAL);
}

export function pingAPI() {
  const ok = () => dispatchNetworkUp("user.api", now());
  const no = () => dispatchNetworkDown("user.api", now());
  return axios.get(API.current.devicePath).then(ok, no);
}
