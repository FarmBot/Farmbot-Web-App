import { store } from "../redux/store";
import { networkUp, networkDown } from "./actions";
import { Edge } from "./interfaces";
import { Actions } from "../constants";

/* ABOUT THIS FILE: These functions allow us to mark the network as up or
down from anywhere within the app (even outside of React-Redux). I usually avoid
directly importing `store`, but in this particular instance it might be
unavoidable. */

/** throttle calls to these functions to avoid unnecessary re-paints. */
const SLOWDOWN_TIME = 1500;

export const networkUptimeThrottleStats: Record<Edge, number> = {
  "user.api": 0,
  "user.mqtt": 0,
  "bot.mqtt": 0
};

function shouldThrottle(edge: Edge, now: number): boolean {
  const then = networkUptimeThrottleStats[edge];
  const diff = now - then;
  return diff < SLOWDOWN_TIME;
}

function bumpThrottle(edge: Edge, now: number) {
  networkUptimeThrottleStats[edge] = now;
}

export const dispatchQosStart = (id: string) => {
  store.dispatch({
    type: Actions.PING_START,
    payload: { id }
  });
};

export let dispatchNetworkUp = (edge: Edge, at: number) => {
  if (shouldThrottle(edge, at)) { return; }
  store.dispatch(networkUp(edge, at));
  bumpThrottle(edge, at);
};

export let dispatchNetworkDown = (edge: Edge, at: number) => {
  if (shouldThrottle(edge, at)) { return; }
  store.dispatch(networkDown(edge, at));
  bumpThrottle(edge, at);
};

export const pingOK = (id: string, at: number) => {
  const action = { type: Actions.PING_OK, payload: { id, at } };
  store.dispatch(action);
};

export const pingNO = (id: string) => {
  const action = { type: Actions.PING_OK, payload: { id } };
  store.dispatch(action);
};
