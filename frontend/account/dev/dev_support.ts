import { store } from "../../redux/store";
import {
  getWebAppConfigValue, setWebAppConfigValue,
} from "../../config_storage/actions";
import { BooleanConfigKey } from "farmbot/dist/resources/configs/web_app";

namespace devStorage {
  const webAppConfigKey = "internal_use" as BooleanConfigKey;
  const { dispatch, getState } = store;
  export enum Key {
    FUTURE_FE_FEATURES = "FUTURE_FE_FEATURES",
    FBOS_VERSION_OVERRIDE = "FBOS_VERSION_OVERRIDE",
    QUICK_DELETE_MODE = "QUICK_DELETE_MODE",
  }
  type Storage = { [K in Key]: string };

  const loadStorage = (): Storage =>
    JSON.parse("" + (getWebAppConfigValue(getState)(webAppConfigKey) || "{}"));

  const saveStorage = (storage: Storage): void => {
    const storageString = JSON.stringify(storage);
    setWebAppConfigValue(webAppConfigKey, storageString)(dispatch, getState);
  };

  export const getItem = (key: Key): string | undefined => loadStorage()[key];

  export const setItem = (key: Key, value: string): void => {
    const storage = loadStorage();
    storage[key] = value;
    saveStorage(storage);
  };

  export const removeItem = (key: Key): void => {
    const storage = loadStorage();
    delete storage[key];
    saveStorage(storage);
  };
}

export namespace DevSettings {

  export const FUTURE_FE_FEATURES = devStorage.Key.FUTURE_FE_FEATURES;
  /** Unstable FE features enabled? */
  export const futureFeaturesEnabled = () =>
    !!devStorage.getItem(FUTURE_FE_FEATURES);
  /** Show unstable FE features for development purposes. */
  export const enableFutureFeatures = () =>
    devStorage.setItem(FUTURE_FE_FEATURES, "true");
  export const disableFutureFeatures = () =>
    devStorage.removeItem(FUTURE_FE_FEATURES);

  export const FBOS_VERSION_OVERRIDE = devStorage.Key.FBOS_VERSION_OVERRIDE;
  export const MAX_FBOS_VERSION_OVERRIDE = "1000.0.0";
  /**
   * Escape hatch for platform developers doing offline development.
   * Use `setFbosVersionOverride` or `setMaxFbosVersionOverride`
   * to adjust override level.
   */
  export const overriddenFbosVersion = () =>
    devStorage.getItem(FBOS_VERSION_OVERRIDE);
  export const resetFbosVersionOverride = () =>
    devStorage.removeItem(FBOS_VERSION_OVERRIDE);
  export const setFbosVersionOverride = (override: string) =>
    devStorage.setItem(FBOS_VERSION_OVERRIDE, override);
  export const setMaxFbosVersionOverride = () =>
    devStorage.setItem(FBOS_VERSION_OVERRIDE, MAX_FBOS_VERSION_OVERRIDE);

  export const QUICK_DELETE_MODE = devStorage.Key.QUICK_DELETE_MODE;
  export const quickDeleteEnabled = () =>
    !!devStorage.getItem(QUICK_DELETE_MODE);
  export const enableQuickDelete = () =>
    devStorage.setItem(QUICK_DELETE_MODE, "true");
  export const disableQuickDelete = () =>
    devStorage.removeItem(QUICK_DELETE_MODE);
}
