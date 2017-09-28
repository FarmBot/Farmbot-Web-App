import { store } from "../redux/store";
import { networkUp, networkDown } from "./actions";
console.log("Loaded...");

/* ABOUT THIS FILE: These functions allow us to mark the network as up or
down from anywhere within the app (even outside of React-Redux). */

export let dispatchNetworkUp =
  (time = (new Date()).toJSON()) => {
    store.dispatch(networkUp());
  };

export let dispatchNetworkDown =
  (time = (new Date()).toJSON()) => store.dispatch(networkDown());
