import { Everything } from "../interfaces";
import {
  selectAllPeripherals,
  selectAllWebcamFeeds,
  selectAllSensors,
  selectAllSensorReadings,
  maybeGetTimeSettings
} from "../resources/selectors";
import { Props } from "./interfaces";
import { validFwConfig } from "../util";
import { getWebAppConfigValue } from "../config_storage/actions";
import { getFirmwareConfig } from "../resources/getters";
import { uniq } from "lodash";
import { getStatus } from "../connectivity/reducer_support";
import { getEnv, getShouldDisplayFn } from "../farmware/state_to_props";

export function mapStateToProps(props: Everything): Props {
  const fwConfig = validFwConfig(getFirmwareConfig(props.resources.index));
  const { mcu_params } = props.bot.hardware;

  const shouldDisplay = getShouldDisplayFn(props.resources.index, props.bot);
  const env = getEnv(props.resources.index, shouldDisplay, props.bot);

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
  };
}
