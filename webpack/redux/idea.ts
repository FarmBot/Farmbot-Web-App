import { Middleware } from "redux";
import { Actions } from "../constants";

const fn: Middleware = (store) => (next) => (action: any) {
  if (action.type === Actions.RESOURCE_READY) {
    console.log("HMMMM   " + action.payload.name);
  }
  return next(action);
};

export const idea = { fn, env: "*" };
