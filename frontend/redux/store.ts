import { createStore } from "redux";
import { EnvName, Store } from "./interfaces";
import { rootReducer } from "./root_reducer";
import { registerSubscribers } from "./subscribers";
import { getMiddleware } from "./middlewares";
import { set } from "lodash";

let storeInstance: Store | undefined;

function getStore(envName: EnvName): Store {
  return createStore(rootReducer,
    undefined,
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
  storeInstance = store2;
  return store2;
}

const getStoreInstance = () => storeInstance ?? configureStore();

export const store: Store = new Proxy({} as Store, {
  get: (_target, prop: keyof Store) => getStoreInstance()[prop],
  set: (_target, prop: string | symbol, value: unknown) =>
    Reflect.set(getStoreInstance() as object, prop, value),
});
