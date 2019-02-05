import { didLogin, setToken } from "../auth/actions";
import { Thunk } from "../redux/interfaces";
import { Session } from "../session";
import { maybeRefreshToken } from "../refresh_token";
import { AuthState } from "../auth/interfaces";
import { timeout } from "promise-timeout";

export const storeToken =
  (old: AuthState, dispatch: Function) => (_new: AuthState | undefined) => {
    const t = _new || old;
    (!_new) && console.warn("Failed to refresh token. Something is wrong.");
    dispatch(setToken(t));
    didLogin(t, dispatch);
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
      const ok = storeToken(auth, dispatch);
      const no = () => ok(undefined);
      const p = maybeRefreshToken(auth);
      timeout(p, MAX_TOKEN_WAIT_TIME).then(ok, no);
    } else {
      Session.clear();
    }
  };
}
