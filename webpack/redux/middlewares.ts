import thunk from "redux-thunk";
import { applyMiddleware, compose, Middleware } from "redux";
import { EnvName } from "./interfaces";
import { Actions } from "../constants";
import { generateRefreshTrigger } from "../connectivity/subscribe_and_refresh_bot";
import { maybeGetDevice } from "../device";

interface MiddlewareConfig {
  fn: Middleware;
  env: EnvName;
}

const maybePingBot = generateRefreshTrigger();
const stateFetchMiddleware: Middleware =
  (store) => (next) => (action: any) => {
    const device = maybeGetDevice();
    const action_type = action.type;
    if (device && action_type === Actions.NETWORK_EDGE_CHANGE) {
      maybePingBot(device, store.getState() as any);
    }
    return next(action);
  };
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
    fn: stateFetchMiddleware
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
