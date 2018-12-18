import { GetState } from "../redux/interfaces";
import { edit, save } from "../api/crud";
import {
  BooleanConfigKey,
  WebAppConfig,
  NumberConfigKey,
  StringConfigKey
} from "farmbot/dist/resources/configs/web_app";
import { getWebAppConfig } from "../resources/getters";

/** Inverts boolean config key in WebAppConfig object, stored in the API. */
export function toggleWebAppBool(key: BooleanConfigKey) {
  return (dispatch: Function, getState: GetState) => {
    const conf = getWebAppConfig(getState().resources.index);
    if (conf) {
      const val = !(conf.body as WebAppConfig)[key];
      dispatch(edit(conf, { [key]: val }));
      dispatch(save(conf.uuid));
    } else {
      throw new Error("Toggled settings before app was loaded.");
    }
  };
}

type WebAppConfigKey =
  BooleanConfigKey
  | NumberConfigKey
  | StringConfigKey;

type WebAppConfigValue = boolean | number | string | undefined;

export type GetWebAppConfigValue = (k: WebAppConfigKey) => WebAppConfigValue;

export function getWebAppConfigValue(getState: GetState) {
  return (key: WebAppConfigKey): WebAppConfigValue => {
    const conf = getWebAppConfig(getState().resources.index);
    return conf && (conf.body as WebAppConfig)[key];
  };
}

export function setWebAppConfigValue(
  key: WebAppConfigKey, value: WebAppConfigValue) {
  return (dispatch: Function, getState: GetState) => {
    const conf = getWebAppConfig(getState().resources.index);
    if (conf) {
      dispatch(edit(conf, { [key]: value }));
      dispatch(save(conf.uuid));
    } else {
      throw new Error("Changed settings before app was loaded.");
    }
  };
}
