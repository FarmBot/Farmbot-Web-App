import {
  generateRefreshTrigger
} from "../connectivity/generate_refresh_trigger";
import { maybeGetDevice } from "../device";
import { get } from "lodash";
import { Edge } from "../connectivity/interfaces";
import { MiddlewareConfig } from "./middlewares";
import { Middleware } from "redux";
import { Actions } from "../constants";

const maybePingBot = generateRefreshTrigger();
const expectation: Edge = "bot.mqtt";
const stateFetchMiddleware: Middleware =
  (store) => (next) => (action: any) => {
    const device = maybeGetDevice();
    const action_type = action.type;
    const x = get(action, "payload.name", "?");
    if (device
      && action_type === Actions.NETWORK_EDGE_CHANGE
      && x === expectation) {
      maybePingBot(device, store.getState() as any);
    }
    return next(action);
  };

export const stateFetchMiddlewareConfig: MiddlewareConfig = {
  env: "*",
  fn: stateFetchMiddleware
};
