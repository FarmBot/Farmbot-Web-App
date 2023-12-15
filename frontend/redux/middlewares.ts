import { thunk } from "redux-thunk";
import { Store, Middleware, applyMiddleware, compose, StoreEnhancer } from "redux";
import { EnvName, ReduxAction } from "./interfaces";
import { stateFetchMiddlewareConfig } from "./state_fetch_middleware";
import { revertToEnglishMiddleware } from "./revert_to_english_middleware";
import { versionChangeMiddleware } from "./version_tracker_middleware";
import { Everything } from "../interfaces";
import { refilterLogsMiddleware } from "./refilter_logs_middleware";

export interface MW extends Middleware {
  (store: Store<Everything>):
    (dispatch: Function) =>
      (action: ReduxAction<object>) => void;
}

export interface MiddlewareConfig { fn: MW; env: EnvName; }

/** To make it easier to manage all things watching the state tree,
 * we keep subscriber functions in this array. */
const mwConfig: MiddlewareConfig[] = [
  { env: "*", fn: thunk },
  { env: "development", fn: require("redux-immutable-state-invariant").default() },
  stateFetchMiddlewareConfig,
  revertToEnglishMiddleware,
  versionChangeMiddleware,
  refilterLogsMiddleware,
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMiddleware(env: EnvName): StoreEnhancer<any, {}> {
  const middlewareFns = mwConfig
    .filter(mwc => (mwc.env === env) || (mwc.env === "*"))
    .map(mwc => mwc.fn);
  const middleware = applyMiddleware(...middlewareFns);
  return compose(middleware);
}
