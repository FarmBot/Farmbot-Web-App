import { authReducer as auth } from "../auth/reducer";
import { botReducer as bot } from "../devices/reducer";
import { configReducer as config } from "../config/reducer";
import { draggableReducer as draggable } from "../draggable/reducer";
import { combineReducers } from "redux";
import { ReduxAction } from "./interfaces";
import { Session } from "../session";
import { resourceReducer as resources } from "../resources/reducer"

export let reducers = combineReducers({
  auth,
  bot,
  config,
  draggable,
  resources
});
/** This is the topmost reducer in the application. If you need to preempt a
 * "normal" reducer this is the place to do it */
export function rootReducer(
  /** Sorry for the `any` here. */
  state: {} | any,
  action: ReduxAction<{}>) {
  if (action.type === "LOGOUT") {
    Session.clear(true);
  }
  return reducers(state, action);
};
