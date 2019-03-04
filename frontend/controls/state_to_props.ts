import { Everything } from "../interfaces";
import {
  selectAllPeripherals,
  selectAllWebcamFeeds,
  selectAllSensors,
  maybeGetDevice,
  selectAllSensorReadings,
  maybeGetTimeOffset
} from "../resources/selectors";
import { Props } from "./interfaces";
import {
  validFwConfig, shouldDisplay, determineInstalledOsVersion
} from "../util";
import { getWebAppConfigValue } from "../config_storage/actions";
import { getFirmwareConfig } from "../resources/getters";
import { uniq } from "lodash";

export function mapStateToProps(props: Everything): Props {
  const peripherals = uniq(selectAllPeripherals(props.resources.index));
  const sensors = uniq(selectAllSensors(props.resources.index));
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
    peripherals,
    sensors,
    botToMqttStatus,
    firmwareSettings: fwConfig || mcu_params,
    shouldDisplay: shouldDisplay(installedOsVersion, props.bot.minOsFeatureData),
    getWebAppConfigVal,
    sensorReadings: selectAllSensorReadings(props.resources.index),
    timeOffset: maybeGetTimeOffset(props.resources.index),
  };
}
