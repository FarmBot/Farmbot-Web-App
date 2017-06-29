import * as Axios from "axios";
import { t } from "i18next";
import { error, success } from "farmbot-toastr";
import { connectDevice, fetchReleases } from "../devices/actions";
import { push } from "../history";
import { AuthState } from "./interfaces";
import { ReduxAction, Thunk } from "../redux/interfaces";
import * as Sync from "../sync/actions";
import { API } from "../api";
import { toastErrors } from "../util";
import { Session } from "../session";
import { UnsafeError } from "../interfaces";
import {
  responseFulfilled,
  responseRejected,
  requestFulfilled
} from "../interceptors";
import { Actions } from "../constants";

export function didLogin(authState: AuthState, dispatch: Function) {
  API.setBaseUrl(authState.token.unencoded.iss);
  dispatch(fetchReleases(authState.token.unencoded.os_update_server));
  dispatch(loginOk(authState));

  Sync.fetchSyncData(dispatch);
  dispatch(connectDevice(authState.token.encoded));
};

// We need to handle OK logins for numerous use cases (Ex: login & registration)
function onLogin(dispatch: Function) {
  return (response: Axios.AxiosXHR<AuthState>) => {
    let { data } = response;
    Session.put(data);
    didLogin(data, dispatch);
    push("/app/controls");
  };
};

export function login(username: string, password: string, url: string): Thunk {
  return dispatch => {
    return requestToken(username, password, url).then(
      onLogin(dispatch),
      (err) => dispatch(loginErr())
    );
  };
}

function loginErr() {
  error(t("Login failed."));
  return { type: "LOGIN_ERR" };
}

/** Very important. Once called, all outbound HTTP requests will
 * have a JSON Web Token attached to their "Authorization" header,
 * thereby granting access to the API. */
export function loginOk(auth: AuthState): ReduxAction<AuthState> {
  Axios.interceptors.response.use(responseFulfilled, responseRejected);
  Axios.interceptors.request.use(requestFulfilled(auth));

  return {
    type: Actions.LOGIN_OK,
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
    let p = requestRegistration(name,
      email,
      password,
      confirmation,
      url);
    return p.then(onLogin(dispatch),
      onRegistrationErr(dispatch));
  };
}

/** Handle user registration errors. */
export function onRegistrationErr(dispatch: Function) {
  return (err: UnsafeError) => {
    toastErrors(err);
    dispatch({
      type: "REGISTRATION_ERROR",
      payload: err
    });
  };
}

/** Build a JSON object in preparation for an HTTP POST
 *  to registration endpoint */
function requestRegistration(name: string,
  email: string,
  password: string,
  confirmation: string,
  url: string) {
  let form = {
    user: {
      email: email,
      password: password,
      password_confirmation: confirmation,
      name: name
    }
  };
  return Axios.post<AuthState>(API.current.usersPath, form);
}

/** Fetch API token if already registered. */
function requestToken(email: string,
  password: string,
  url: string) {
  let payload = { user: { email: email, password: password } };
  // Set the base URL once here.
  // It will get set once more when we get the "iss" claim from the JWT.
  API.setBaseUrl(url);
  return Axios.post<AuthState>(API.current.tokensPath, payload);
}

export function logout() {
  // When logging out, we pop up a toast message to confirm logout.
  // Sometimes, LOGOUT is dispatched when the user is already logged out.
  // In those cases, seeing a logout message may confuse the user.
  // To circumvent this, we must check if the user had a token.
  // If there was infact a token, we can safely show the message.
  if (Session.get()) { success("You have been logged out."); }
  Session.clear(true);
  // Technically this is unreachable code:
  return {
    type: "LOGOUT",
    payload: {}
  };
}
