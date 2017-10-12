import axios from "axios";
import { API } from "./api/index";
import { AuthState } from "./auth/interfaces";
import { HttpData } from "./util";
import { setToken } from "./auth/actions";

/** Grab a new token from the API (won't extend token's exp. date).
 * Redirect to home page on failure. */
export let maybeRefreshToken = (old: AuthState): Promise<AuthState> => {
  API.setBaseUrl(old.token.unencoded.iss);
  setToken(old); // The Axios interceptors might not be set yet.
  type Resp = HttpData<AuthState>;

  return axios.get(API.current.tokensPath).then((x: Resp) => {
    setToken(old);
    return x.data;
  }, (x) => {
    return Promise.reject("X");
  });
};
