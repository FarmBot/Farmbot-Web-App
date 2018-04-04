import { authReducer as auth } from "../auth/reducer";
import { botReducer as bot } from "../devices/reducer";
import { configReducer as config } from "../config/reducer";
import { draggableReducer as draggable } from "../draggable/reducer";
import { combineReducers } from "redux";
import { ReduxAction } from "./interfaces";
import { Session } from "../session";
import { resourceReducer as resources } from "../resources/reducer";
import { Everything } from "../interfaces";
import { Actions } from "../constants";

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
  state: Everything,
  action: ReduxAction<{}>) {
  (action.type === Actions.LOGOUT) && Session.clear();

  // TODO: Get rid of this nasty type cast / hack. Resulted from TSC 2.4 upgrade
  // - RC 30 JUN 17
  return reducers(state, action) as Everything;
}
