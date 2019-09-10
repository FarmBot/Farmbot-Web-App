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
    type: Actions.START_QOS_PING,
    payload: { id }
  });
};

export let dispatchNetworkUp = (edge: Edge, at: number, qosPingId?: string) => {
  if (shouldThrottle(edge, at)) { return; }
  store.dispatch(networkUp(edge, at, qosPingId));
  bumpThrottle(edge, at);
};

const pingAlreadyComplete = (qosPingId?: string) => {
  if (qosPingId) {
    const allPings = store.getState().bot.connectivity.pings;
    const thePing = allPings[qosPingId];
    return (thePing && thePing.kind == "complete");
  }
  return false;
};

export let dispatchNetworkDown = (edge: Edge, at: number, qosPingId?: string) => {
  if (shouldThrottle(edge, at)) { return; }
  // If a ping is marked as "completed", then there
  // is no way that the network is down. A common
  // use case for this is the timeout callback
  // in the QoS tester. The timeout always triggers,
  // so we need to add a means of cancelling the
  // "network down" action if the request completed
  // before the timeout.
  if (pingAlreadyComplete(qosPingId)) { return; }
  store.dispatch(networkDown(edge, at, qosPingId));
  bumpThrottle(edge, at);
};
