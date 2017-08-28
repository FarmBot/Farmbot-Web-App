import thunk from "redux-thunk";
import { applyMiddleware, compose, Middleware } from "redux";
import { EnvName } from "./interfaces";

interface MiddlewareConfig {
  fn: Middleware;
  env: EnvName;
}

/** To make it easier to manage all things watching the state tree,
 * we keep subscriber functions in this array. */
export let mwConfig: MiddlewareConfig[] = [
  {
    env: "*",
    fn: thunk
  }
  , {
    env: "development",
    fn: require("redux-immutable-state-invariant").default()
  }
];

declare var __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: Function;

export function getMiddleware(env: EnvName) {
  const middlewareFns = mwConfig
    .filter(function (mwc) { return (mwc.env === env) || (mwc.env === "*"); })
    .map((mwc) => mwc.fn);
  const dtCompose = __REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  const composeEnhancers = dtCompose || compose;
  const middlewares = applyMiddleware(...middlewareFns);

  return composeEnhancers(middlewares);
}
