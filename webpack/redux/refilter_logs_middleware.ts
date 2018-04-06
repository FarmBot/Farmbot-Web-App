import { Actions } from "../constants";
import { Middleware } from "redux";
import { MiddlewareConfig } from "./middlewares";
import { ResourceName } from "../resources/tagged_resources";
import { throttledLogRefresh } from "./refresh_logs";

const WEB_APP_CONFIG: ResourceName = "WebAppConfig";

/** TODO: Write docs. */
export const fn: Middleware = () => (dispatch) => (action: any) => {
  const needsRefresh = action
    && action.payload
    && action.type === Actions.UPDATE_RESOURCE_OK
    && action.payload.kind === WEB_APP_CONFIG;

  needsRefresh && throttledLogRefresh(dispatch);

  return dispatch(action);
};

export const refilterLogsMiddleware: MiddlewareConfig = { fn, env: "*" };
