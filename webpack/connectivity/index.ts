import { store } from "../redux/store";
import { networkUp, networkDown } from "./actions";
import { Edge } from "./interfaces";

/* ABOUT THIS FILE: These functions allow us to mark the network as up or
down from anywhere within the app (even outside of React-Redux). I usually avoid
directly importing `store`, but in this particular instance it might be
unavoidable. */

export let dispatchNetworkUp =
  (edge: Edge, at = (new Date()).toJSON()) => {
    return store.dispatch(networkUp(edge, at));
  };

export let dispatchNetworkDown =
  (edge: Edge, at = (new Date()).toJSON()) => {
    return store.dispatch(networkDown(edge, at));
  };
