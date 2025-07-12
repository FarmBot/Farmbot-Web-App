import { store } from "../../redux/store";
import {
  TaggedFbosConfig, TaggedFirmwareConfig, TaggedWebAppConfig,
} from "farmbot";
import { calculateAxialLengths } from "../../controls/move/direction_axes_props";
import {
  getFbosConfig, getFirmwareConfig, getWebAppConfig,
} from "../../resources/getters";
import { XyzNumber } from "./interfaces";
import { FirmwareConfig } from "farmbot/dist/resources/configs/firmware";
import { WebAppConfig } from "farmbot/dist/resources/configs/web_app";
import { FbosConfig } from "farmbot/dist/resources/configs/fbos";

export const getFirmwareSettings = (): FirmwareConfig => {
  const fwConfig = getFirmwareConfig(store.getState().resources.index);
  const firmwareSettings = (fwConfig as TaggedFirmwareConfig).body;
  return firmwareSettings;
};

export const getWebAppSettings = (): WebAppConfig => {
  const webAppConfig = getWebAppConfig(store.getState().resources.index);
  const webAppSettings = (webAppConfig as TaggedWebAppConfig).body;
  return webAppSettings;
};

export const getFbosSettings = (): FbosConfig => {
  const fbosConfig = getFbosConfig(store.getState().resources.index);
  const fbosSettings = (fbosConfig as TaggedFbosConfig).body;
  return fbosSettings;
};

export const getGardenSize = (): XyzNumber => {
  const firmwareSettings = getFirmwareSettings();
  const lengths = calculateAxialLengths({ firmwareSettings });
  const webAppSettings = getWebAppSettings();
  return {
    x: lengths.x || webAppSettings.map_size_x,
    y: lengths.y || webAppSettings.map_size_y,
    z: lengths.z || 500,
  };
};

export const getSafeZ = (): number => {
  const fbosSettings = getFbosSettings();
  return fbosSettings.safe_height || 0;
};
