import thunk from "redux-thunk";
import { applyMiddleware, compose, Middleware } from "redux";
import { EnvName, ReduxAction } from "./interfaces";
import { Actions } from "../constants";
import { maybeGetDevice } from "../device";
import { subscribeAndRefreshBot } from "../connectivity/subscribe_and_refresh_bot";
import { Everything } from "../interfaces";
import { Store } from "redux";

interface MiddlewareConfig {
  fn: Middleware;
  env: EnvName;
}
const pinger = subscribeAndRefreshBot();
/** To make it easier to manage all things watching the state tree,
 * we keep subscriber functions in this array. */
export let mwConfig: MiddlewareConfig[] = [
  {
    env: "*",
    fn: thunk
  }, {
    env: "development",
    fn: require("redux-immutable-state-invariant").default()
  }, {
    env: "*",
    fn: (store: any) => next => (action: ReduxAction<{}>) => {
      const { type } = action;
      const device = maybeGetDevice();
      if (device && type === Actions.NETWORK_EDGE_CHANGE) {
        debugger;
      }
    }
  }

];

export function getMiddleware(env: EnvName) {
  const middlewareFns = mwConfig
    .filter(function (mwc) { return (mwc.env === env) || (mwc.env === "*"); })
    .map((mwc) => mwc.fn);
  const wow = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  const dtCompose = wow && wow({
    actionsBlacklist: [
      Actions.NETWORK_EDGE_CHANGE,
      Actions.RESOURCE_READY
    ]
  });
  const composeEnhancers = dtCompose || compose;
  const middlewares = applyMiddleware(...middlewareFns);

  return composeEnhancers(middlewares);
}
