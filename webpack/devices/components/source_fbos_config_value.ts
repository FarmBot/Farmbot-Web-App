import { FbosConfig } from "../../config_storage/fbos_configs";
import { Configuration, ConfigurationName } from "farmbot";
import { SourceFbosConfig } from "../interfaces";

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
