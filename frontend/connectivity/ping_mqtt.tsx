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
export const ACTIVE_THRESHOLD = PING_INTERVAL * 2;

export const LAST_IN: keyof FarmBotInternalConfig = "LAST_PING_IN";
export const LAST_OUT: keyof FarmBotInternalConfig = "LAST_PING_OUT";
type Direction = "in" | "out";

export function readPing(bot: Farmbot, direction: Direction): number | undefined {
  const val = bot.getConfig(direction === "out" ? LAST_OUT : LAST_IN);
  return isNumber(val) ? val : undefined;
}

export function markStale() {
  dispatchNetworkDown("bot.mqtt", now());
}

export function markActive() {
  dispatchNetworkUp("user.mqtt", now());
  dispatchNetworkUp("bot.mqtt", now());
}

export function isInactive(last: number, now_: number): boolean {
  return last ? (now_ - last) > ACTIVE_THRESHOLD : true;
}

export function sendOutboundPing(bot: Farmbot) {
  const id = uuid();
  const ok = () => pingOK(id, now()); markActive();
  const no = () => pingNO(id); markStale();
  dispatchQosStart(id);
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
