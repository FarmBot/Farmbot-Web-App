import { Actions } from "../constants";
import { Middleware } from "redux";
import { MiddlewareConfig } from "./middlewares";
import { ResourceName } from "farmbot";
import { throttledLogRefresh } from "./refresh_logs";

const WEB_APP_CONFIG: ResourceName = "WebAppConfig";

const LOG_RELATED_FIELDS = [
  "success_log", "busy_log", "warn_log", "error_log",
  "info_log", "fun_log", "debug_log", "assertion_log",
] as const;

// Cache the last seen values of each log related field
export type LogField = typeof LOG_RELATED_FIELDS[number];
const cache: Partial<Record<LogField, unknown>> = {};

// Refresh logs only when a log related WebAppConfig is changed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fn: Middleware = () => (dispatch) => (action: any) => {
  const { type, payload } = action;

  // Only proceed for WebAppConfig save actions
  if (type !== Actions.SAVE_RESOURCE_OK || payload?.kind !== WEB_APP_CONFIG) {
    return dispatch(action);
  }

  const body = payload.body || {};

  // Log related keys present in the update
  const presentLogKeys = Object.keys(body)
    .filter((key): key is LogField => LOG_RELATED_FIELDS.includes(key as LogField));

  // Check if any have changed
  const changed = presentLogKeys.some((k) => cache[k] !== body[k]);

  // Update cache
  presentLogKeys.forEach((k) => { cache[k] = body[k]; });

  if (changed) {
    throttledLogRefresh(dispatch);
  }

  return dispatch(action);
};

export const refilterLogsMiddleware: MiddlewareConfig = { fn, env: "*" };
