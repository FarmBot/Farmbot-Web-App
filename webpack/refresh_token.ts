import axios from "axios";
import { API } from "./api/index";
import { AuthState } from "./auth/interfaces";
import { HttpData } from "./util";
import { setToken } from "./auth/actions";

type Resp = HttpData<AuthState>;

/** What to do when the Token refresh request completes. */
const ok = (x: Resp) => {
  setToken(x.data); // Start using new token in HTTP requests.
  return x.data;
};

/** Grab a new token from the API (won't extend token's exp. date).
 * Redirect to home page on failure. */
export let maybeRefreshToken
  = (old: AuthState): Promise<AuthState | undefined> => {
    API.setBaseUrl(old.token.unencoded.iss);
    setToken(old); // Precaution: The Axios interceptors might not be set yet.
    return axios
      .get(API.current.tokensPath)
      .then(ok, () => Promise.resolve(undefined));
  };
