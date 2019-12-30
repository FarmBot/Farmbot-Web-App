import { Everything } from "../interfaces";
import { Store as ReduxStore, Reducer, AnyAction } from "redux";
import { Actions } from "../constants";

export type Store = ReduxStore<Everything>;

export interface ReduxAction<T> {
  readonly type: Actions;
  readonly payload: T;
}

/** The "getState()" function, typically passed in by Redux Thunk Middleware. */
export type GetState = () => Everything;

/** A Redux Thunk function. */
export interface Thunk {
  (dispatch: Function, getState: GetState): unknown;
}

export type EnvName = "test" | "production" | "development" | "*";

export type Reducers = Reducer<Omit<Everything, "dispatch">, AnyAction>;
