import { store } from "../redux/store";
import { networkUp, networkDown } from "./actions";

/* ABOUT THIS FILE: These functions allow us to mark the network as up or
down from anywhere within the app (even outside of React-Redux). I usually avoid
directly importing `store`, but in this particular instance it might be
unavoidable. */

export let dispatchNetworkUp =
  (time = (new Date()).toJSON()) => {
    store.dispatch(networkUp());
  };

export let dispatchNetworkDown =
  (time = (new Date()).toJSON()) => store.dispatch(networkDown());
