import type { Everything } from "../interfaces";
import type { Store as ReduxStore, Reducer, Action } from "redux";
import type { Actions } from "../constants";

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

export type Reducers = Reducer<Omit<Everything, "dispatch">, Action>;

export type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> }
