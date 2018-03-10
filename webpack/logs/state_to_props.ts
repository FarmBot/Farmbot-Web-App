import { Everything } from "../interfaces";
import { selectAllLogs, maybeGetTimeOffset } from "../resources/selectors";
import * as _ from "lodash";
import { LogsProps } from "./interfaces";
import {
  sourceFbosConfigValue
} from "../devices/components/source_config_value";
import { getFbosConfig } from "../resources/selectors_by_kind";
import { validFbosConfig } from "../util";

export function mapStateToProps(props: Everything): LogsProps {
  const { hardware } = props.bot;
  const fbosConfig = validFbosConfig(getFbosConfig(props.resources.index));
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
