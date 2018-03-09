import { Everything } from "../interfaces";
import {
  selectAllPeripherals,
  selectAllWebcamFeeds,
  getFirmwareConfig
} from "../resources/selectors";
import { Props } from "./interfaces";
import { maybeFetchUser } from "../resources/selectors";
import * as _ from "lodash";
import { validFwConfig } from "../util";

export function mapStateToProps(props: Everything): Props {
  const peripherals = _.uniq(selectAllPeripherals(props.resources.index));
  const resources = props.resources;
  const bot2mqtt = props.bot.connectivity["bot.mqtt"];
  const botToMqttStatus = bot2mqtt ? bot2mqtt.state : "down";
  const fwConfig = validFwConfig(getFirmwareConfig(props.resources.index));
  const { mcu_params } = props.bot.hardware;

  return {
    feeds: selectAllWebcamFeeds(resources.index),
    dispatch: props.dispatch,
    bot: props.bot,
    user: maybeFetchUser(props.resources.index),
    peripherals,
    botToMqttStatus,
    firmwareSettings: fwConfig || mcu_params,
  };
}
