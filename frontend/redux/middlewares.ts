import thunk from "redux-thunk";
import { applyMiddleware, compose } from "redux";
import { EnvName, ReduxAction } from "./interfaces";
import { Actions } from "../constants";
import { stateFetchMiddlewareConfig } from "./state_fetch_middleware";
import { revertToEnglishMiddleware } from "./revert_to_english_middleware";
import { versionChangeMiddleware } from "./version_tracker_middleware";
import { Everything } from "../interfaces";
import { Middleware } from "redux";
import { Store } from "redux";
import { refilterLogsMiddleware } from "./refilter_logs_middleware";

export interface MW extends Middleware {
  (store: Store<Everything>):
    (dispatch: Function) =>
      (action: ReduxAction<object>) => void;
}

export interface MiddlewareConfig { fn: MW; env: EnvName; }

/** To make it easier to manage all things watching the state tree,
 * we keep subscriber functions in this array. */
export let mwConfig: MiddlewareConfig[] = [
  { env: "*", fn: thunk },
  { env: "development", fn: require("redux-immutable-state-invariant").default() },
  stateFetchMiddlewareConfig,
  revertToEnglishMiddleware,
  versionChangeMiddleware,
  refilterLogsMiddleware
];

export function getMiddleware(env: EnvName) {
  const middlewareFns = mwConfig
    .filter(function (mwc) { return (mwc.env === env) || (mwc.env === "*"); })
    .map((mwc) => mwc.fn);
  // tslint:disable-next-line:no-any
  const wow = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  const dtCompose = wow && wow({
    actionsBlacklist: [
      Actions.NETWORK_EDGE_CHANGE,
      Actions.PING_NO,
      Actions.PING_OK,
      Actions.PING_START,
      Actions.RESOURCE_READY
    ]
  });
  const composeEnhancers = dtCompose || compose;
  const middleware = applyMiddleware(...middlewareFns);

  return composeEnhancers(middleware);
}
