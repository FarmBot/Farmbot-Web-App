import { store } from "../redux/store";
import { networkUp, networkDown } from "./actions";
import { Edge } from "./interfaces";
import { debounce } from "lodash";

/** Debounce calls to these functions to avoid unnecessary re-paints. */
const SLOWDOWN_TIME = 1500;

/* ABOUT THIS FILE: These functions allow us to mark the network as up or
down from anywhere within the app (even outside of React-Redux). I usually avoid
directly importing `store`, but in this particular instance it might be
unavoidable. */

export let dispatchNetworkUp =
  debounce((edge: Edge, at = (new Date()).toJSON()) => {
    return store.dispatch(networkUp(edge, at));
  }, SLOWDOWN_TIME);

export let dispatchNetworkDown =
  debounce((edge: Edge, at = (new Date()).toJSON()) => {
    return store.dispatch(networkDown(edge, at));
  }, SLOWDOWN_TIME);
