import { FbosConfig } from "../../config_storage/fbos_configs";
import {
  Configuration, ConfigurationName, McuParams, McuParamName
} from "farmbot";
import { SourceFbosConfig, SourceFwConfig } from "../interfaces";
import { FirmwareConfig } from "../../config_storage/firmware_configs";

export const sourceFbosConfigValue =
  (apiConfig: FbosConfig | undefined, botConfig: Configuration
  ): SourceFbosConfig =>
    (setting: ConfigurationName) => {
      const apiValue = apiConfig && apiConfig[setting as keyof FbosConfig];
      const botValue = botConfig[setting];
      return {
        value: apiConfig ? apiValue : botValue,
        consistent: apiConfig ? apiValue === botValue : true
      };
    };

export const sourceFwConfigValue =
  (apiConfig: FirmwareConfig | undefined, botConfig: McuParams
  ): SourceFwConfig =>
    (setting: McuParamName) => {
      const apiValue = apiConfig && apiConfig[setting];
      const botValue = botConfig[setting];
      return {
        value: apiConfig ? apiValue : botValue,
        consistent: apiConfig ? apiValue === botValue : true
      };
    };
