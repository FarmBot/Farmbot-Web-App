import { GetState } from "../redux/interfaces";
import { edit, save } from "../api/crud";
import { StringConfigKey } from "farmbot/dist/resources/configs/web_app";
import { getWebAppConfig } from "../resources/getters";
import { ResourceIndex } from "../resources/interfaces";
import type {
  WebAppBooleanConfigKeyAll,
  WebAppNumberConfigKeyAll,
} from "../session_keys";

/** Inverts boolean config key in WebAppConfig object, stored in the API. */
export function toggleWebAppBool(key: WebAppBooleanConfigKeyAll) {
  return (dispatch: Function, getState: GetState) => {
    const conf = getWebAppConfig(getState().resources.index);
    if (conf) {
      const body = conf.body as WebAppConfigValues;
      dispatch(edit(conf, { [key]: !body[key] }));
      dispatch(save(conf.uuid));
    } else {
      throw new Error("Toggled settings before app was loaded.");
    }
  };
}

export type WebAppConfigKey =
  WebAppBooleanConfigKeyAll
  | WebAppNumberConfigKeyAll
  | StringConfigKey;

type WebAppConfigValue = boolean | number | string | undefined;
type WebAppConfigValues = Partial<Record<WebAppConfigKey, WebAppConfigValue>>;

export type GetWebAppConfigValue = (k: WebAppConfigKey) => WebAppConfigValue;

export function getWebAppConfigValue(getState: GetState) {
  return (key: WebAppConfigKey): WebAppConfigValue => {
    const conf = getWebAppConfig(getState().resources.index);
    return conf && (conf.body as WebAppConfigValues)[key];
  };
}

export function getWebAppConfigValueFromResources(resourceIndex: ResourceIndex) {
  return (key: WebAppConfigKey): WebAppConfigValue => {
    const conf = getWebAppConfig(resourceIndex);
    return conf && (conf.body as WebAppConfigValues)[key];
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
