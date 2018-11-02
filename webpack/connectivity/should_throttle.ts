import { Edge } from "./interfaces";
/** throttle calls to these functions to avoid unnecessary re-paints. */
const SLOWDOWN_TIME = 1500;

const lastCalledAt: Record<Edge, number> = {
  "user.api": 0, "user.mqtt": 0, "bot.mqtt": 0
};

export function bumpThrottle(edge: Edge, now: number) {
  lastCalledAt[edge] = now;
}

export function shouldThrottle(edge: Edge, now: number): boolean {
  const then = lastCalledAt[edge];
  const diff = then - now;

  return diff > SLOWDOWN_TIME;
}
