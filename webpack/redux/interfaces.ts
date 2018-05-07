import { Everything } from "../interfaces";
import { Store } from "redux";
import { Actions } from "../constants";

export type Store = Store<Everything>;

export interface ReduxAction<T> {
  readonly type: Actions;
  readonly payload: T;
}

/** The "getState()" function, typically passed in by Redux Thunk Middleware. */
export type GetState = () => Everything;

/** A Redux Thunk function. */
export interface Thunk {
  // tslint:disable-next-line:no-any
  (dispatch: Function, getState: GetState): any;
}

export type EnvName = "test" | "production" | "development" | "*";
