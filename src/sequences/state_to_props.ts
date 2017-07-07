import { Everything } from "../interfaces";
import { Props } from "./interfaces";
import {
  selectAllSequences,
  selectAllTools,
  findSequence,
  selectAllToolSlotPointers
} from "../resources/selectors";

export function mapStateToProps(props: Everything): Props {
  let uuid = props.resources.consumers.sequences.current;
  let syncStatus =
    props.bot.hardware.informational_settings.sync_status || "unknown";
  return {
    dispatch: props.dispatch,
    sequences: selectAllSequences(props.resources.index),
    tools: selectAllTools(props.resources.index),
    slots: selectAllToolSlotPointers(props.resources.index),
    sequence: (uuid) ? findSequence(props.resources.index, uuid) : undefined,
    auth: props.auth,
    resources: props.resources.index,
    syncStatus
  };
}
