import { Everything } from "../interfaces";
import { Props } from "./interfaces";
import {
  selectAllImages,
  getDeviceAccountSettings
} from "../resources/selectors";

export function mapStateToProps(props: Everything): Props {
  return {
    connectivity: props.connectivity,
    deviceAccount: getDeviceAccountSettings(props.resources.index),
    auth: props.auth,
    bot: props.bot,
    dispatch: props.dispatch,
    images: selectAllImages(props.resources.index)
  };
}
