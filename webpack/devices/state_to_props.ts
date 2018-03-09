import { Everything } from "../interfaces";
import { Props } from "./interfaces";
import {
  selectAllImages,
  getDeviceAccountSettings,
  maybeGetDevice,
  getFirmwareConfig
} from "../resources/selectors";
import { sourceFbosConfigValue } from "./components/source_fbos_config_value";
import { getFbosConfig } from "../resources/selectors_by_kind";
import { determineInstalledOsVersion, shouldDisplay } from "../util";

export function mapStateToProps(props: Everything): Props {
  const { hardware } = props.bot;
  const maybeFbosConfig = getFbosConfig(props.resources.index);
  const fbosConfig = maybeFbosConfig && maybeFbosConfig.body.api_migrated
    ? maybeFbosConfig.body
    : undefined;
  const maybeFirmwareConfig = getFirmwareConfig(props.resources.index);
  const firmwareConfig = maybeFirmwareConfig && maybeFirmwareConfig.body.api_migrated
    ? maybeFirmwareConfig.body
    : undefined;
  const installedOsVersion = determineInstalledOsVersion(
    props.bot, maybeGetDevice(props.resources.index));
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
    shouldDisplay: shouldDisplay(installedOsVersion, props.bot.minOsFeatureData),
    firmwareConfig,
  };
}
