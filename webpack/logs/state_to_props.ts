import { Everything } from "../interfaces";
import { selectAllLogs, maybeGetTimeOffset } from "../resources/selectors";
import * as _ from "lodash";
import { LogsProps } from "./interfaces";
import {
  sourceFbosConfigValue
} from "../devices/components/source_fbos_config_value";
import { getFbosConfig } from "../resources/config_selectors";

export function mapStateToProps(props: Everything): LogsProps {
  const { hardware } = props.bot;
  const conf = getFbosConfig(props.resources.index);
  const fbosConfig = (conf && conf.body && conf.body.api_migrated)
    ? conf.body : undefined;
  return {
    dispatch: props.dispatch,
    sourceFbosConfig: sourceFbosConfigValue(fbosConfig, hardware.configuration),
    logs: _(selectAllLogs(props.resources.index))
      .sortBy("body.created_at")
      .reverse()
      .take(250)
      .value(),
    bot: props.bot,
    timeOffset: maybeGetTimeOffset(props.resources.index)
  };

}
