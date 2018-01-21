import { BooleanConfigKey } from "./web_app_configs";

/** Inverts boolean config key in WebAppConfig object, stored in the API. */
export function toggleWebAppBool(key: BooleanConfigKey) {
  return function (store, getState) {
    console.log("TODO!");
  };
}
