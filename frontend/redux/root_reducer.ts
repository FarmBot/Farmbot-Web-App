import { authReducer as auth } from "../auth/reducer";
import { botReducer as bot } from "../devices/reducer";
import { configReducer as config } from "../config/reducer";
import { draggableReducer as draggable } from "../draggable/reducer";
import { combineReducers } from "redux";
import { ReduxAction } from "./interfaces";
import { Session } from "../session";
import { resourceReducer } from "../resources/reducer";
import { Everything } from "../interfaces";
import { Actions } from "../constants";

const reducerRecord = {
  auth,
  bot,
  config,
  draggable,
  resources: resourceReducer,
};

export const reducers = combineReducers(reducerRecord);

Object.keys(reducerRecord).map((x: keyof typeof reducerRecord) => {
  if (!reducerRecord[x]) {
    throw new Error(`The ${x} reducer is missing. Most likely, a mock is misconfigured`);
  }
});
/** This is the topmost reducer in the application. If you need to preempt a
 * "normal" reducer this is the place to do it */
export function rootReducer(state: Everything, action: ReduxAction<{}>) {
  (action.type === Actions.LOGOUT) && Session.clear();
  return reducers(state, action);
}
