import { MiddlewareConfig } from "./middlewares";
import { Middleware } from "redux";
import { Everything } from "../interfaces";
import { createRefreshTrigger } from "./create_refresh_trigger";

const maybeRefresh = createRefreshTrigger();
const stateFetchMiddleware: Middleware =
  // tslint:disable-next-line:no-any
  (store) => (next) => (action: any) => {
    // tslint:disable-next-line:no-any
    const s: Everything = store.getState() as any;
    maybeRefresh(s.bot.connectivity.uptime["bot.mqtt"]);
    next(action);
  };

export const stateFetchMiddlewareConfig: MiddlewareConfig =
  ({ env: "*", fn: stateFetchMiddleware });
