import { Everything } from "../interfaces";
import {
  selectAllLogs, maybeGetTimeSettings, maybeGetDevice
} from "../resources/selectors";
import { LogsProps } from "./interfaces";
import {
  sourceFbosConfigValue
} from "../devices/components/source_config_value";
import {
  validFbosConfig, determineInstalledOsVersion,
  createShouldDisplayFn as shouldDisplayFunc
} from "../util";
import { ResourceIndex } from "../resources/interfaces";
import { TaggedLog } from "farmbot";
import { getWebAppConfigValue } from "../config_storage/actions";
import { getFbosConfig } from "../resources/getters";
import { chain } from "lodash";
import { DevSettings } from "../account/dev/dev_support";

/** Take the specified number of logs after sorting by time created. */
export function takeSortedLogs(
  numberOfLogs: number, ri: ResourceIndex): TaggedLog[] {
  return chain(selectAllLogs(ri))
    .sortBy("body.created_at")
    .reverse()
    .take(numberOfLogs)
    .value();
}

export function mapStateToProps(props: Everything): LogsProps {
  const { hardware } = props.bot;
  const fbosConfig = validFbosConfig(getFbosConfig(props.resources.index));
  const sourceFbosConfig =
    sourceFbosConfigValue(fbosConfig, hardware.configuration);
  const installedOsVersion = determineInstalledOsVersion(
    props.bot, maybeGetDevice(props.resources.index));
  const fbosVersionOverride = DevSettings.overriddenFbosVersion();
  const shouldDisplay = shouldDisplayFunc(
    installedOsVersion, props.bot.minOsFeatureData, fbosVersionOverride);
  return {
    dispatch: props.dispatch,
    sourceFbosConfig,
    logs: takeSortedLogs(250, props.resources.index),
    timeSettings: maybeGetTimeSettings(props.resources.index),
    getConfigValue: getWebAppConfigValue(() => props),
    shouldDisplay,
  };
}
