import { store } from "../redux/store";
import { networkUp, networkDown } from "./actions";
import { Edge } from "./interfaces";

/* ABOUT THIS FILE: These functions allow us to mark the network as up or
down from anywhere within the app (even outside of React-Redux). I usually avoid
directly importing `store`, but in this particular instance it might be
unavoidable. */

/** throttle calls to these functions to avoid unnecessary re-paints. */
const SLOWDOWN_TIME = 1500;

const lastCalledAt: Record<Edge, number> = {
  "user.api": 0, "user.mqtt": 0, "bot.mqtt": 0
};

function shouldThrottle(edge: Edge, now: number): boolean {
  const then = lastCalledAt[edge];
  const diff = now - then;
  return diff < SLOWDOWN_TIME;
}

function bumpThrottle(edge: Edge, now: number) {
  lastCalledAt[edge] = now;
}

export let dispatchNetworkUp = (edge: Edge, at = (new Date()).getTime(), why: string) => {
  if (shouldThrottle(edge, at)) { return; }
  store.dispatch(networkUp(edge, at, why));
  bumpThrottle(edge, at);
};

export let dispatchNetworkDown = (edge: Edge, at = (new Date()).getTime(), why: string) => {
  if (shouldThrottle(edge, at)) { return; }
  store.dispatch(networkDown(edge, at, why));
  bumpThrottle(edge, at);
};
