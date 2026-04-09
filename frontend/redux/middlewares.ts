import { thunk } from "redux-thunk";
import { Middleware, applyMiddleware, compose, StoreEnhancer } from "redux";
import { EnvName } from "./interfaces";
import { stateFetchMiddlewareConfig } from "./state_fetch_middleware";
import { revertToEnglishMiddleware } from "./revert_to_english_middleware";
import { versionChangeMiddleware } from "./version_tracker_middleware";
import { refilterLogsMiddleware } from "./refilter_logs_middleware";

export interface MiddlewareConfig { fn: Middleware; env: EnvName; }

/** To make it easier to manage all things watching the state tree,
 * we keep subscriber functions in this array. */
const mwConfig: MiddlewareConfig[] = [
  { env: "*", fn: thunk },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
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
