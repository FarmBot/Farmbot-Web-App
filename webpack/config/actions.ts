import { didLogin } from "../auth/actions";
import { Thunk } from "../redux/interfaces";
import { Session } from "../session";

/** Lets Redux know that the app is ready to bootstrap. */
export function ready(): Thunk {
  return (dispatch, getState) => {
    const state = Session.getAll() || getState().auth;
    console.log("HELLO?");
    if (state) {
      didLogin(state, dispatch);
    }
  };
}
