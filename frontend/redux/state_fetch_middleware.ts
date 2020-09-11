import { MiddlewareConfig } from "./middlewares";
import { Middleware } from "redux";
import { Everything } from "../interfaces";
import { createRefreshTrigger } from "./create_refresh_trigger";

const maybeRefresh = createRefreshTrigger();
const stateFetchMiddleware: Middleware =
  (store) => (next) => (action) => {
    const s: Everything = store.getState();
    maybeRefresh(s.bot.connectivity.uptime["bot.mqtt"]);
    next(action);
  };

export const stateFetchMiddlewareConfig: MiddlewareConfig =
  ({ env: "*", fn: stateFetchMiddleware });
