import { Middleware } from "redux";
import { Actions } from "../constants";
import { MiddlewareConfig } from "./middlewares";
import { ResourceName } from "../resources/tagged_resources";
import { throttle, noop } from "lodash";
import { Log } from "../interfaces";
import { API } from "../api";
import axios from "axios";

const WEB_APP_CONFIG: ResourceName = "WebAppConfig";

const doRefresh = (dispatch: Function) => {
  const name: ResourceName = "Log";
  console.log("Re-indexing all the logs");
  axios
    .get<Log[]>(API.current.filteredLogsPath)
    .then((r) => dispatch({
      type: Actions.RESOURCE_READY,
      payload: { name, data: r.data }
    }))
    .catch(noop);
};

const throttledRefresh = throttle(doRefresh, 1000);

/**
 * TODO: Write docs.
 */
const fn: Middleware = () => (dispatch) => (action: any) => {
  const needsRefresh = action
    && action.type === Actions.UPDATE_RESOURCE_OK
    && action.payload.name === WEB_APP_CONFIG
    && action.payload;

  needsRefresh && throttledRefresh(dispatch);

  return dispatch(action);
};

export const refilterLogsMiddleware: MiddlewareConfig = { fn, env: "*" };
