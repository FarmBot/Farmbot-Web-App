import { Farmbot, RpcRequest } from "farmbot";
import { dispatchNetworkDown, dispatchNetworkUp } from "./index";
import { isNumber } from "lodash";
import axios from "axios";
import { API } from "../api/index";
import { timestamp } from "../util";

export const PING_INTERVAL = 3000;
export const ACTIVE_THRESHOLD = PING_INTERVAL * 2;

const label = "ping";
export const LAST_IN = "LAST_PING_IN";
export const LAST_OUT = "LAST_PING_OUT";
export const PING: Readonly<RpcRequest> = { kind: "rpc_request", args: { label } };

type Direction = "in" | "out";

export function writePing(bot: Farmbot, direction: Direction) {
  const dir = direction === "out" ? LAST_OUT : LAST_IN;
  bot.setState(dir, timestamp());
}

export function readPing(bot: Farmbot, direction: Direction): number | undefined {
  const val = bot.getState()[direction === "out" ? LAST_OUT : LAST_IN];
  return isNumber(val) ? val : undefined;
}

export function markStale() {
  dispatchNetworkDown("bot.mqtt");
}

export function markActive() {
  dispatchNetworkUp("user.mqtt");
  dispatchNetworkUp("bot.mqtt");
}

export function isInactive(last: number, now: number): boolean {
  return last ? (now - last) > ACTIVE_THRESHOLD : true;
}

export function sendOutboundPing(bot: Farmbot) {
  bot.publish(PING);
  const now = timestamp();
  const lastPing = readPing(bot, "in");
  lastPing && (isInactive(lastPing, now) ? markStale() : markActive());
  writePing(bot, "out");
}

export function startPinging(bot: Farmbot) {
  setInterval(() => sendOutboundPing(bot), PING_INTERVAL);
  bot.on(label, () => writePing(bot, "in"));
}

export function pingAPI() {
  const ok = () => dispatchNetworkUp("user.api");
  const no = () => dispatchNetworkDown("user.api");
  axios.get(API.current.devicePath).then(ok, no);
}
