import { Farmbot, RpcRequest } from "farmbot";
import { dispatchNetworkDown, dispatchNetworkUp } from "./index";
import { isNumber } from "lodash";

const PING_INTERVAL = 1000;
const label = "ping";
export const LAST_IN = "LAST_PING_IN";
export const LAST_OUT = "LAST_PING_OUT";
export const PING: Readonly<RpcRequest> = { kind: "rpc_request", args: { label } };
const timestamp = () => Math.round((new Date()).getTime());

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
  console.log("Stale.");
  dispatchNetworkDown("bot.mqtt");
}

export function markActive() {
  console.log("Active.");
  dispatchNetworkUp("bot.mqtt");
  dispatchNetworkUp("user.mqtt");
}

export function isInactive(last: number | undefined, now: number): boolean {
  return last ? (now - last) > (PING_INTERVAL * 2) : false;
}

export function sendOutboundPing(bot: Farmbot) {
  bot.publish(PING);
  const now = timestamp();
  const lastPing = readPing(bot, "in");
  isInactive(lastPing, now) ? markStale() : markActive();
  writePing(bot, "out");
}

export function startPinging(bot: Farmbot) {
  setInterval(() => sendOutboundPing(bot), PING_INTERVAL);
  bot.on(label, () => writePing(bot, "in"));
}
