import { Everything } from "../interfaces";
import {
  selectAllPeripherals,
  selectAllWebcamFeeds,
  getFirmwareConfig,
  selectAllSensors,
  maybeGetDevice
} from "../resources/selectors";
import { Props } from "./interfaces";
import { maybeFetchUser } from "../resources/selectors";
import * as _ from "lodash";
import {
  validFwConfig, shouldDisplay, determineInstalledOsVersion
} from "../util";
import { BooleanSetting } from "../session_keys";
import { getWebAppConfigValue } from "../config_storage/actions";

export function mapStateToProps(props: Everything): Props {
  const peripherals = _.uniq(selectAllPeripherals(props.resources.index));
  const sensors = _.uniq(selectAllSensors(props.resources.index));
  const resources = props.resources;
  const bot2mqtt = props.bot.connectivity["bot.mqtt"];
  const botToMqttStatus = bot2mqtt ? bot2mqtt.state : "down";
  const fwConfig = validFwConfig(getFirmwareConfig(props.resources.index));
  const { mcu_params } = props.bot.hardware;
  const installedOsVersion = determineInstalledOsVersion(
    props.bot, maybeGetDevice(props.resources.index));
  const getWebAppConfigVal = getWebAppConfigValue(() => props);

  return {
    feeds: selectAllWebcamFeeds(resources.index),
    dispatch: props.dispatch,
    bot: props.bot,
    user: maybeFetchUser(props.resources.index),
    peripherals,
    sensors,
    botToMqttStatus,
    firmwareSettings: fwConfig || mcu_params,
    shouldDisplay: shouldDisplay(installedOsVersion, props.bot.minOsFeatureData),
    xySwap: !!getWebAppConfigVal(BooleanSetting.xy_swap),
  };
}
