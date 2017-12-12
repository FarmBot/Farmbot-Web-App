import { Everything } from "../interfaces";
import { Props } from "./interfaces";
import {
  selectAllImages,
  getDeviceAccountSettings
} from "../resources/selectors";

export function mapStateToProps(props: Everything): Props {
  return {
    userToApi: props.connectivity["user.api"],
    userToMqtt: props.connectivity["user.mqtt"],
    botToMqtt: props.connectivity["bot.mqtt"],
    deviceAccount: getDeviceAccountSettings(props.resources.index),
    auth: props.auth,
    bot: props.bot,
    dispatch: props.dispatch,
    images: selectAllImages(props.resources.index),
    resources: props.resources.index,
  };
}
