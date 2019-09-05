import { Farmbot, uuid } from "farmbot";
import {
  dispatchNetworkDown,
  dispatchNetworkUp,
  dispatchQosStart
} from "./index";
import { isNumber } from "lodash";
import axios from "axios";
import { API } from "../api/index";
import { FarmBotInternalConfig } from "farmbot/dist/config";

export const PING_INTERVAL = 4000;
export const ACTIVE_THRESHOLD = PING_INTERVAL * 2;

export const LAST_IN: keyof FarmBotInternalConfig = "LAST_PING_IN";
export const LAST_OUT: keyof FarmBotInternalConfig = "LAST_PING_OUT";
type Direction = "in" | "out";

export function readPing(bot: Farmbot, direction: Direction): number | undefined {
  const val = bot.getConfig(direction === "out" ? LAST_OUT : LAST_IN);
  return isNumber(val) ? val : undefined;
}

export function markStale(_uuid: string) {
  // dispatch({ pings: failPing(this.pingState, id) })
  dispatchNetworkDown("bot.mqtt");
}

export function markActive(_uuid: string) {
  // dispatch({ pings: completePing(this.pingState, id) })
  dispatchNetworkUp("user.mqtt");
  dispatchNetworkUp("bot.mqtt");
}

export function isInactive(last: number, now: number): boolean {
  return last ? (now - last) > ACTIVE_THRESHOLD : true;
}

export function sendOutboundPing(bot: Farmbot) {
  const id = uuid();
  const ok = () => markActive(id);
  const no = () => markStale(id);
  dispatchQosStart(id);
  setTimeout(no, PING_INTERVAL);
  bot.ping().then(ok, no);
}

export function startPinging(bot: Farmbot) {
  sendOutboundPing(bot);
  setInterval(() => sendOutboundPing(bot), PING_INTERVAL);
}

export function pingAPI() {
  const ok = () => dispatchNetworkUp("user.api");
  const no = () => dispatchNetworkDown("user.api");
  return axios.get(API.current.devicePath).then(ok, no);
}
