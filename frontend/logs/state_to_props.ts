import { selectAllLogs } from "../resources/selectors";
import { ResourceIndex } from "../resources/interfaces";
import { TaggedLog } from "farmbot";
import { chain } from "lodash";
import { Everything } from "../interfaces";
import { LogsPanelProps } from "./interfaces";

/** Take the specified number of logs after sorting by time created. */
export function takeSortedLogs(
  numberOfLogs: number, ri: ResourceIndex): TaggedLog[] {
  return chain(selectAllLogs(ri))
    .sortBy("body.created_at")
    .reverse()
    .take(numberOfLogs)
    .value();
}

export const mapStateToProps = (props: Everything): LogsPanelProps => {
  return {
    dispatch: props.dispatch,
  };
};
