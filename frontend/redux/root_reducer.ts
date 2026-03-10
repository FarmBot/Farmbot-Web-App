import { combineReducers } from "redux";
import type { ReduxAction, Reducers } from "./interfaces";
import { Session } from "../session";
import type { Everything } from "../interfaces";
import { Actions } from "../constants";
import { authReducer as auth } from "../auth/reducer";
import { botReducer as bot } from "../devices/reducer";
import { configReducer as config } from "../config/reducer";
import { draggableReducer as draggable } from "../draggable/reducer";
import { resourceReducer as resources } from "../resources/reducer";
import { appReducer as app } from "../reducer";

let cachedReducers: Reducers | undefined;

const getReducers = (): Reducers => {
  cachedReducers ??= combineReducers({
    auth,
    bot,
    config,
    draggable,
    resources,
    app,
  });
  return cachedReducers;
};

export const reducers: Reducers =
  (state, action) => getReducers()(state, action);

/** This is the topmost reducer in the application. If you need to preempt a
 * "normal" reducer this is the place to do it */
export function rootReducer(
  state: Omit<Everything, "dispatch">, action: ReduxAction<{}>) {
  (action.type === Actions.LOGOUT) && Session.clear();
  return reducers(state, action);
}
