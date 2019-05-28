import { Farmbot } from "farmbot";
import { dispatchNetworkDown, dispatchNetworkUp } from "./index";
import { isNumber } from "lodash";
import axios from "axios";
import { API } from "../api/index";
import { FarmBotInternalConfig } from "farmbot/dist/config";

export const PING_INTERVAL = 3000;
export const ACTIVE_THRESHOLD = PING_INTERVAL * 2;

export const LAST_IN: keyof FarmBotInternalConfig = "LAST_PING_IN";
export const LAST_OUT: keyof FarmBotInternalConfig = "LAST_PING_OUT";
type Direction = "in" | "out";

export function readPing(bot: Farmbot, direction: Direction): number | undefined {
  const val = bot.getConfig(direction === "out" ? LAST_OUT : LAST_IN);
  return isNumber(val) ? val : undefined;
}

export function markStale() {
  dispatchNetworkDown("bot.mqtt", undefined, "markStale()");
}

export function markActive() {
  dispatchNetworkUp("user.mqtt", undefined, "markActive()");
  dispatchNetworkUp("bot.mqtt", undefined, "markActive()");
}

export function isInactive(last: number, now: number): boolean {
  return last ? (now - last) > ACTIVE_THRESHOLD : true;
}

export function sendOutboundPing(bot: Farmbot) {
  bot.ping().then(markActive, markStale);
}

export function startPinging(bot: Farmbot) {
  setInterval(() => sendOutboundPing(bot), PING_INTERVAL);
}

export function pingAPI() {
  const ok = () => dispatchNetworkUp("user.api", undefined, "pingApi OK");
  const no = () => dispatchNetworkDown("user.api", undefined, "pingApi NO");
  return axios.get(API.current.devicePath).then(ok, no);
}
