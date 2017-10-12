import { didLogin, setToken } from "../auth/actions";
import { Thunk } from "../redux/interfaces";
import { Session } from "../session";
import { maybeRefreshToken } from "../refresh_token";
import { withTimeout } from "../util";
import { AuthState } from "../auth/interfaces";

export const storeToken =
  (auth: AuthState, dispatch: Function) => () => {
    dispatch(setToken(auth));
    didLogin(auth, dispatch);
  };

/** Amount of time we're willing to wait before concluding that the token is bad
 * or the API is down. */
const MAX_TOKEN_WAIT_TIME = 10000;

/** (IMPORTANT) One of the highest level callbacks in the app.
 * called once DOM is ready and React is attached to the DOM.
 * => Lets Redux know that the app is ready to bootstrap.
 * => Checks for token updates since last log in. */
export function ready(): Thunk {
  return (dispatch, getState) => {
    const auth = Session.fetchStoredToken() || getState().auth;
    if (auth) {
      withTimeout(MAX_TOKEN_WAIT_TIME, maybeRefreshToken(auth))
        .then(storeToken(auth, dispatch), Session.clear);
    } else {
      Session.clear();
    }
  };
}
