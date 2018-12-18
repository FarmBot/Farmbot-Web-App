import { API } from "../api";
import { noop, throttle } from "lodash";
import axios from "axios";
import { ResourceName } from "farmbot";
import { Log } from "farmbot/dist/resources/api_resources";
import { resourceReady, newTaggedResource } from "../sync/actions";
const kind: ResourceName = "Log";

/** re-Downloads all logs from the API and force replaces all entries for logs
 * in the state tree. */
export const refreshLogs = async (dispatch: Function) => {
  return axios
    .get<Log[]>(API.current.filteredLogsPath)
    .then(({ data }) => {
      dispatch(resourceReady(kind, newTaggedResource("Log", data)));
    }, noop);
};

export const throttledLogRefresh = throttle(refreshLogs, 1000);
