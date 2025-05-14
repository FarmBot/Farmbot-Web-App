import { Actions } from "../constants";
import { Middleware } from "redux";
import { MiddlewareConfig } from "./middlewares";
import { ResourceName, TaggedResource } from "farmbot";
import { throttledLogRefresh } from "./refresh_logs";

const WEB_APP_CONFIG: ResourceName = "WebAppConfig";

const LOG_RELATED_FIELDS = [
  "success_log", "busy_log", "warn_log", "error_log",
  "info_log", "fun_log", "debug_log", "assertion_log",
] as const;

// Cache the last seen values of each log related field
export type LogField = typeof LOG_RELATED_FIELDS[number];
const cache: Partial<Record<LogField, number>> = {};

interface ResourceAction {
  type: Actions;
  payload: TaggedResource;
}

// Refresh logs only when a log related WebAppConfig is changed
export const fn: Middleware = () => (dispatch) => (action: ResourceAction) => {
  const { type, payload } = action;

  // Only proceed for WebAppConfig save actions
  if (type !== Actions.SAVE_RESOURCE_OK || payload.kind !== WEB_APP_CONFIG) {
    return dispatch(action);
  }

  const { body } = payload;

  // Check if the action contains a changed log related field
  let changed = false;
  LOG_RELATED_FIELDS.forEach(key => {
    if (key in body) {
      const newValue = body[key as keyof typeof body] as number;
      if (cache[key] !== newValue) {
        changed = true;
      }
      cache[key] = newValue;
    }
  });

  if (changed) {
    throttledLogRefresh(dispatch);
  }

  return dispatch(action);
};

export const refilterLogsMiddleware: MiddlewareConfig = { fn, env: "*" };
