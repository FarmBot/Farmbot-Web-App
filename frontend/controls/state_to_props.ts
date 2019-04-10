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
import { getStatus } from "../connectivity/reducer_support";

export function mapStateToProps(props: Everything): Props {
  const fwConfig = validFwConfig(getFirmwareConfig(props.resources.index));
  const { mcu_params } = props.bot.hardware;

  const device = maybeGetDevice(props.resources.index);
  const installedOsVersion = determineInstalledOsVersion(props.bot, device);

  return {
    feeds: selectAllWebcamFeeds(props.resources.index),
    dispatch: props.dispatch,
    bot: props.bot,
    peripherals: uniq(selectAllPeripherals(props.resources.index)),
    sensors: uniq(selectAllSensors(props.resources.index)),
    botToMqttStatus: getStatus(props.bot.connectivity["bot.mqtt"]),
    firmwareSettings: fwConfig || mcu_params,
    shouldDisplay: shouldDisplay(installedOsVersion, props.bot.minOsFeatureData),
    getWebAppConfigVal: getWebAppConfigValue(() => props),
    sensorReadings: selectAllSensorReadings(props.resources.index),
    timeOffset: maybeGetTimeOffset(props.resources.index),
  };
}
