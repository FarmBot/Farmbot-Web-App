import axios, { AxiosResponse } from "axios";
import { t } from "i18next";
import { error, success } from "farmbot-toastr";
import {
  fetchReleases, fetchMinOsFeatureData, FEATURE_MIN_VERSIONS_URL
} from "../devices/actions";
import { push } from "../history";
import { AuthState } from "./interfaces";
import { ReduxAction, Thunk } from "../redux/interfaces";
import * as Sync from "../sync/actions";
import { API } from "../api";
import { Session } from "../session";
import { UnsafeError } from "../interfaces";
import {
  responseFulfilled,
  responseRejected,
  requestFulfilled
} from "../interceptors";
import { Actions } from "../constants";
import { connectDevice } from "../connectivity/connect_device";
import { toastErrors } from "../toast_errors";
import { getFirstPartyFarmwareList } from "../farmware/actions";

export function didLogin(authState: AuthState, dispatch: Function) {
  API.setBaseUrl(authState.token.unencoded.iss);
  const { os_update_server, beta_os_update_server } = authState.token.unencoded;
  dispatch(fetchReleases(os_update_server));
  beta_os_update_server && beta_os_update_server != "NOT_SET" &&
    dispatch(fetchReleases(beta_os_update_server, { beta: true }));
  dispatch(getFirstPartyFarmwareList());
  dispatch(fetchMinOsFeatureData(FEATURE_MIN_VERSIONS_URL));
  dispatch(setToken(authState));
  Sync.fetchSyncData(dispatch);
  dispatch(connectDevice(authState));
}

// We need to handle OK logins for numerous use cases (Ex: login & registration)
function onLogin(dispatch: Function) {
  return (response: AxiosResponse<AuthState>) => {
    const { data } = response;
    Session.replaceToken(data);
    didLogin(data, dispatch);
    push("/app/controls");
  };
}

export function login(username: string, password: string, url: string): Thunk {
  return dispatch => {
    return requestToken(username, password, url).then(
      onLogin(dispatch),
      () => dispatch(loginErr())
    );
  };
}

export function loginErr() {
  error(t("Login failed."));
  return { type: Actions.LOGIN_ERROR };
}

/** Very important. Once called, all outbound HTTP requests will
 * have a JSON Web Token attached to their "Authorization" header,
 * thereby granting access to the API. */
export function setToken(auth: AuthState): ReduxAction<AuthState> {
  axios.interceptors.request.use(requestFulfilled(auth));
  axios.interceptors.response.use(responseFulfilled, responseRejected);

  return {
    type: Actions.REPLACE_TOKEN,
    payload: auth
  };
}

/** Sign up for the FarmBot service over AJAX. */
export function register(name: string,
  email: string,
  password: string,
  confirmation: string,
  url: string): Thunk {
  return dispatch => {
    return requestRegistration(name, email, password, confirmation)
      .then(onLogin(dispatch), onRegistrationErr(dispatch));
  };
}

/** Handle user registration errors. */
export function onRegistrationErr(dispatch: Function) {
  return (err: UnsafeError) => toastErrors(err);
}

/** Build a JSON object in preparation for an HTTP POST
 *  to registration endpoint */
export function requestRegistration(name: string,
  email: string,
  password: string,
  password_confirmation: string) {

  const form = { user: { email, password, password_confirmation, name } };
  return axios.post(API.current.usersPath, form);
}

/** Fetch API token if already registered. */
export function requestToken(email: string,
  password: string,
  url: string) {
  const payload = { user: { email: email, password: password } };
  // Set the base URL once here.
  // It will get set once more when we get the "iss" claim from the JWT.
  API.setBaseUrl(url);
  return axios.post(API.current.tokensPath, payload);
}

export function logout() {
  // When logging out, we pop up a toast message to confirm logout.
  // Sometimes, LOGOUT is dispatched when the user is already logged out.
  // In those cases, seeing a logout message may confuse the user.
  // To circumvent this, we must check if the user had a token.
  // If there was infact a token, we can safely show the message.
  if (Session.fetchStoredToken()) {
    success(t("You have been logged out."));
  }

  Session.clear();
  // Technically this is unreachable code:
  return {
    type: Actions.LOGOUT,
    payload: {}
  };
}
