import axios, { AxiosRequestConfig } from "axios";
import {
  fetchReleases, fetchMinOsFeatureData, FEATURE_MIN_VERSIONS_URL,
  fetchLatestGHBetaRelease
} from "../devices/actions";
import { AuthState } from "./interfaces";
import { ReduxAction } from "../redux/interfaces";
import * as Sync from "../sync/actions";
import { API } from "../api";
import {
  responseFulfilled,
  responseRejected,
  requestFulfilled
} from "../interceptors";
import { Actions } from "../constants";
import { connectDevice } from "../connectivity/connect_device";
import { getFirstPartyFarmwareList } from "../farmware/actions";
import { store } from "../redux/store";
import { appIsReadonly } from "../resources/selectors";
import { warning } from "../toast/toast";

export function didLogin(authState: AuthState, dispatch: Function) {
  API.setBaseUrl(authState.token.unencoded.iss);
  const { os_update_server, beta_os_update_server } = authState.token.unencoded;
  dispatch(fetchReleases(os_update_server));
  beta_os_update_server && beta_os_update_server != "NOT_SET" &&
    dispatch(fetchLatestGHBetaRelease(beta_os_update_server));
  dispatch(getFirstPartyFarmwareList());
  dispatch(fetchMinOsFeatureData(FEATURE_MIN_VERSIONS_URL));
  dispatch(setToken(authState));
  Sync.fetchSyncData(dispatch);
  dispatch(connectDevice(authState));
}

const readOnlyInterceptor = (config: AxiosRequestConfig) => {
  const method = (config.method || "get").toLowerCase();
  const relevant = ["put", "patch", "delete"].includes(method);

  if (relevant && appIsReadonly(store.getState().resources.index)) {
    if (!(config.url || "").includes("web_app_config")) {
      warning("Refusing to modify data in read-only mode");
      return Promise.reject(config);
    }
  }

  return Promise.resolve(config);
};

/** Very important. Once called, all outbound HTTP requests will
 * have a JSON Web Token attached to their "Authorization" header,
 * thereby granting access to the API. */
export function setToken(auth: AuthState): ReduxAction<AuthState> {
  axios.interceptors.request.use(readOnlyInterceptor);
  axios.interceptors.request.use(requestFulfilled(auth));
  axios.interceptors.response.use(responseFulfilled, responseRejected);
  return {
    type: Actions.REPLACE_TOKEN,
    payload: auth
  };
}
