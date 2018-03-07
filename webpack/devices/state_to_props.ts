import { Everything } from "../interfaces";
import { Props } from "./interfaces";
import {
  selectAllImages,
  getDeviceAccountSettings
} from "../resources/selectors";
import { sourceFbosConfigValue } from "./components/source_fbos_config_value";
import { getFbosConfig } from "../resources/config_selectors";

export function mapStateToProps(props: Everything): Props {
  const conf = getFbosConfig(props.resources.index);
  const { hardware } = props.bot;
  const fbosConfig = (conf && conf.body && conf.body.api_migrated)
    ? conf.body : undefined;
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
  };
}
