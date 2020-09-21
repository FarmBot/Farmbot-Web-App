import axios from "axios";
import { fetchMinOsFeatureData, fetchOsReleaseNotes } from "../devices/actions";
import { AuthState } from "./interfaces";
import { ReduxAction } from "../redux/interfaces";
import * as Sync from "../sync/actions";
import { API } from "../api";
import {
  responseFulfilled,
  responseRejected,
  requestFulfilled,
} from "../interceptors";
import { Actions } from "../constants";
import { connectDevice } from "../connectivity/connect_device";
import { getFirstPartyFarmwareList } from "../farmware/actions";
import { readOnlyInterceptor } from "../read_only_mode";

export function didLogin(authState: AuthState, dispatch: Function) {
  API.setBaseUrl(authState.token.unencoded.iss);
  dispatch(getFirstPartyFarmwareList());
  dispatch(fetchMinOsFeatureData());
  dispatch(fetchOsReleaseNotes());
  dispatch(setToken(authState));
  Sync.fetchSyncData(dispatch);
  dispatch(connectDevice(authState));
}

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
