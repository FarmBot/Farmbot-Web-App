import { Everything } from "../interfaces";
import {
  selectAllPeripherals,
  getDeviceAccountSettings
} from "../resources/selectors";
import { Props } from "./interfaces";
import { maybeFetchUser } from "../resources/selectors";

export function mapStateToProps(props: Everything): Props {
  let peripherals = _.uniq(selectAllPeripherals(props.resources.index));
  let resources = props.resources;

  return {
    account: getDeviceAccountSettings(resources.index),
    dispatch: props.dispatch,
    bot: props.bot,
    user: maybeFetchUser(props.resources.index),
    resources,
    peripherals
  };
}

