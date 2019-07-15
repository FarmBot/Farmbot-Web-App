import { Everything } from "../interfaces";
import { Props, Feature } from "./interfaces";
import {
  selectAllImages,
  getDeviceAccountSettings,
  maybeGetDevice,
  maybeGetTimeSettings,
} from "../resources/selectors";
import {
  sourceFbosConfigValue, sourceFwConfigValue
} from "./components/source_config_value";
import {
  determineInstalledOsVersion, validFwConfig, validFbosConfig,
  shouldDisplay as shouldDisplayFunc
} from "../util";
import {
  saveOrEditFarmwareEnv, reduceFarmwareEnv
} from "../farmware/state_to_props";
import { getFbosConfig, getFirmwareConfig } from "../resources/getters";
import { DevSettings } from "../account/dev/dev_support";
import { getApiAlerts, getLocalAlerts } from "../messages/state_to_props";

export function mapStateToProps(props: Everything): Props {
  const { hardware } = props.bot;
  const fbosConfig = validFbosConfig(getFbosConfig(props.resources.index));
  const firmwareConfig = validFwConfig(getFirmwareConfig(props.resources.index));
  const installedOsVersion = determineInstalledOsVersion(
    props.bot, maybeGetDevice(props.resources.index));
  const fbosVersionOverride = DevSettings.overriddenFbosVersion();
  const shouldDisplay = shouldDisplayFunc(
    installedOsVersion, props.bot.minOsFeatureData, fbosVersionOverride);
  const env = shouldDisplay(Feature.api_farmware_env)
    ? reduceFarmwareEnv(props.resources.index)
    : props.bot.hardware.user_env;
  return {
    userToApi: props.bot.connectivity["user.api"],
    userToMqtt: props.bot.connectivity["user.mqtt"],
    botToMqtt: props.bot.connectivity["bot.mqtt"],
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
    alerts: [
      ...getLocalAlerts(props.resources.consumers.alerts),
      ...getApiAlerts(props.resources.index)
    ],
  };
}
