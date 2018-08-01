import { Actions } from "../constants";
import { Middleware } from "redux";
import { MiddlewareConfig } from "./middlewares";
import { ResourceName } from "farmbot";
import { throttledLogRefresh } from "./refresh_logs";

const WEB_APP_CONFIG: ResourceName = "WebAppConfig";

/**
 * Middleware function that listens for changes on the `WebAppConfig` resource.
 * If the resource does change, it will trigger a throttled refresh of all log
 * resources, downloading the filtered log list as required from the API. */
export const fn: Middleware = () => (dispatch) => (action: any) => {
  const needsRefresh = action
    && action.payload
    && action.type === Actions.UPDATE_RESOURCE_OK
    && action.payload.kind === WEB_APP_CONFIG;

  needsRefresh && throttledLogRefresh(dispatch);

  return dispatch(action);
};

export const refilterLogsMiddleware: MiddlewareConfig = { fn, env: "*" };
