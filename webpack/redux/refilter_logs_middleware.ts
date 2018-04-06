import { Middleware } from "redux";
import { Actions } from "../constants";
import { MiddlewareConfig } from "./middlewares";
import { ResourceName } from "../resources/tagged_resources";
import { throttle, noop } from "lodash";
import { Log } from "../interfaces";
import { API } from "../api";
import axios from "axios";

const WEB_APP_CONFIG: ResourceName = "WebAppConfig";
const name: ResourceName = "Log";

export const doRefreshLogs = (dispatch: Function) => {
  console.log("Re-indexing all the logs");
  axios.get<Log[]>(API.current.filteredLogsPath).then((r) => dispatch({
    type: Actions.RESOURCE_READY,
    payload: { name, data: r.data }
  }), noop);
};

const throttledRefresh = throttle(doRefreshLogs, 1000);

/** TODO: Write docs. */
const fn: Middleware = () => (dispatch) => (action: any) => {
  const needsRefresh = action
    && action.payload
    && action.type === Actions.UPDATE_RESOURCE_OK
    && action.payload.kind === WEB_APP_CONFIG;

  needsRefresh && throttledRefresh(dispatch);

  return dispatch(action);
};

export const refilterLogsMiddleware: MiddlewareConfig = { fn, env: "*" };
