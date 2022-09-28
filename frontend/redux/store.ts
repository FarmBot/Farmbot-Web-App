import { createStore, PreloadedState } from "redux";
import { EnvName, Store } from "./interfaces";
import { rootReducer } from "./root_reducer";
import { registerSubscribers } from "./subscribers";
import { getMiddleware } from "./middlewares";
import { set } from "lodash";
import { Everything } from "../interfaces";

function getStore(envName: EnvName): Store {
  return createStore(rootReducer,
    {} as PreloadedState<Everything>,
    getMiddleware(envName));
}

export function configureStore() {
  const ENV = process.env.NODE_ENV || "development";
  const store2: Store = (ENV === "production"
    ? getStore("production")
    : getStore("development"));
  // Make store global in case I need to probe it.
  set(window, "store", store2);
  registerSubscribers(store2);
  return store2;
}

export const store = configureStore();
