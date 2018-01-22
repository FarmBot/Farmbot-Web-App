import { Everything } from "../interfaces";
import { selectAllLogs, maybeGetTimeOffset } from "../resources/selectors";
import * as _ from "lodash";
import { LogsProps } from "./interfaces";

export function mapStateToProps(props: Everything): LogsProps {
  return {
    logs: _(selectAllLogs(props.resources.index))
      .sortBy("body.created_at")
      .reverse()
      .take(250)
      .value(),
    bot: props.bot,
    timeOffset: maybeGetTimeOffset(props.resources.index)
  };

}
