import { Everything } from "../interfaces";
import { selectAllLogs, maybeGetDevice } from "../resources/selectors";
import * as _ from "lodash";
import { LogsProps } from "./interfaces";

export function mapStateToProps(props: Everything): LogsProps {
  const dev = maybeGetDevice(props.resources.index);
  return {
    logs: _(selectAllLogs(props.resources.index))
      .sortBy("body.created_at")
      .reverse()
      .take(250)
      .value(),
    bot: props.bot,
    timeOffset: dev ? dev.body.tz_offset_hrs : 0 // Default to UTC
  };

}
