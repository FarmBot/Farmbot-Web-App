import { Everything } from "../interfaces";
import { selectAllLogs } from "../resources/selectors";
import * as _ from "lodash";
import { LogsProps } from "./interfaces";

export function mapStateToProps(props: Everything): LogsProps {

  return {
    logs: _(selectAllLogs(props.resources.index))
      .map(x => x.body)
      .sortBy("created_at")
      .reverse()
      .value()
  };

}
