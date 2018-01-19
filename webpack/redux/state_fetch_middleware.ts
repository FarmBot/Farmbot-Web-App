import { MiddlewareConfig } from "./middlewares";
import { Middleware } from "redux";
import { Everything } from "../interfaces";
import { createRefreshTrigger } from "./create_refresh_trigger";

const maybeRefresh = createRefreshTrigger();
const stateFetchMiddleware: Middleware =
  (store) => (next) => (action: any) => {
    const s: Everything = store.getState() as any;
    maybeRefresh(s.bot.connectivity["bot.mqtt"]);
    next(action);
  };

export const stateFetchMiddlewareConfig: MiddlewareConfig =
  ({ env: "*", fn: stateFetchMiddleware });
