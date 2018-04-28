import { Actions } from "../constants";
import { API } from "../api";
import { Log } from "../interfaces";
import { noop, throttle } from "lodash";
import axios from "axios";
import { ResourceName } from "../resources/tagged_resources";
const name: ResourceName = "Log";

/** re-Downloads all logs from the API and force replaces all entries for logs
 * in the state tree. */
export const refreshLogs = async (dispatch: Function) => {
  return axios.get<Log[]>(API.current.filteredLogsPath).then((r) => dispatch({
    type: Actions.RESOURCE_READY,
    payload: { name, data: r.data }
  }), noop);
};

export const throttledLogRefresh = throttle(refreshLogs, 1000);
