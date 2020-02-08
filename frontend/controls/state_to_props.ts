import { Everything } from "../interfaces";
import {
  selectAllPeripherals,
  selectAllWebcamFeeds,
  selectAllSensors,
  selectAllSensorReadings,
  maybeGetTimeSettings
} from "../resources/selectors";
import { Props } from "./interfaces";
import { validFwConfig, validFbosConfig } from "../util";
import { getWebAppConfigValue } from "../config_storage/actions";
import { getFirmwareConfig, getFbosConfig } from "../resources/getters";
import { uniq } from "lodash";
import { getStatus } from "../connectivity/reducer_support";
import { getEnv, getShouldDisplayFn } from "../farmware/state_to_props";
import { sourceFbosConfigValue } from "../devices/components/source_config_value";
import { isFwHardwareValue } from "../devices/components/firmware_hardware_support";

export function mapStateToProps(props: Everything): Props {
  const fwConfig = validFwConfig(getFirmwareConfig(props.resources.index));
  const { mcu_params } = props.bot.hardware;

  const shouldDisplay = getShouldDisplayFn(props.resources.index, props.bot);
  const env = getEnv(props.resources.index, shouldDisplay, props.bot);

  const { configuration } = props.bot.hardware;
  const fbosConfig = validFbosConfig(getFbosConfig(props.resources.index));
  const sourceFbosConfig = sourceFbosConfigValue(fbosConfig, configuration);
  const { value } = sourceFbosConfig("firmware_hardware");
  const firmwareHardware = isFwHardwareValue(value) ? value : undefined;

  return {
    feeds: selectAllWebcamFeeds(props.resources.index),
    dispatch: props.dispatch,
    bot: props.bot,
    peripherals: uniq(selectAllPeripherals(props.resources.index)),
    sensors: uniq(selectAllSensors(props.resources.index)),
    botToMqttStatus: getStatus(props.bot.connectivity.uptime["bot.mqtt"]),
    firmwareSettings: fwConfig || mcu_params,
    getWebAppConfigVal: getWebAppConfigValue(() => props),
    shouldDisplay,
    sensorReadings: selectAllSensorReadings(props.resources.index),
    timeSettings: maybeGetTimeSettings(props.resources.index),
    env,
    firmwareHardware,
  };
}
