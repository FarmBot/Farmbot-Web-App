import {
  Configuration, ConfigurationName, McuParams, McuParamName,
} from "farmbot";
import { SourceFbosConfig, SourceFwConfig } from "../interfaces";
import { FbosConfig } from "farmbot/dist/resources/configs/fbos";
import { FirmwareConfig } from "farmbot/dist/resources/configs/firmware";

export const sourceFbosConfigValue =
  (apiConfig: FbosConfig | undefined, botConfig: Configuration,
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
  (apiConfig: FirmwareConfig | undefined, botConfig: McuParams,
  ): SourceFwConfig =>
    (setting: McuParamName) => {
      const apiValue = apiConfig && apiConfig[setting];
      const botValue = botConfig[setting];
      return {
        value: apiConfig ? apiValue : botValue,
        consistent: apiConfig ? apiValue === botValue : true
      };
    };
