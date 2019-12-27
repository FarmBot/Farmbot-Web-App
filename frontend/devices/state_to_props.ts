import { Everything } from "../interfaces";
import { Props } from "./interfaces";
import {
  selectAllImages,
  getDeviceAccountSettings,
  maybeGetTimeSettings,
} from "../resources/selectors";
import {
  sourceFbosConfigValue, sourceFwConfigValue
} from "./components/source_config_value";
import { validFwConfig, validFbosConfig } from "../util";
import {
  saveOrEditFarmwareEnv, getEnv, getShouldDisplayFn
} from "../farmware/state_to_props";
import {
  getFbosConfig, getFirmwareConfig, getWebAppConfig
} from "../resources/getters";
import { getAllAlerts } from "../messages/state_to_props";

export function mapStateToProps(props: Everything): Props {
  const { hardware } = props.bot;
  const fbosConfig = validFbosConfig(getFbosConfig(props.resources.index));
  const firmwareConfig = validFwConfig(getFirmwareConfig(props.resources.index));
  const shouldDisplay = getShouldDisplayFn(props.resources.index, props.bot);
  const env = getEnv(props.resources.index, shouldDisplay, props.bot);
  const webAppConfig = getWebAppConfig(props.resources.index);
  if (!webAppConfig) {
    throw new Error("Missing web app config");
  }
  return {
    userToApi: props.bot.connectivity.uptime["user.api"],
    userToMqtt: props.bot.connectivity.uptime["user.mqtt"],
    botToMqtt: props.bot.connectivity.uptime["bot.mqtt"],
    deviceAccount: getDeviceAccountSettings(props.resources.index),
    auth: props.auth,
    bot: props.bot,
    dispatch: props.dispatch,
    images: selectAllImages(props.resources.index),
    resources: props.resources.index,
    sourceFbosConfig: sourceFbosConfigValue(fbosConfig, hardware.configuration),
    sourceFwConfig: sourceFwConfigValue(firmwareConfig, hardware.mcu_params),
    shouldDisplay,
    firmwareConfig,
    isValidFbosConfig: !!fbosConfig,
    env,
    saveFarmwareEnv: saveOrEditFarmwareEnv(props.resources.index),
    timeSettings: maybeGetTimeSettings(props.resources.index),
    alerts: getAllAlerts(props.resources),
    webAppConfig
  };
}
