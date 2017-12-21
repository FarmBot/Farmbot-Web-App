import { Everything } from "../interfaces";
import { Props } from "./interfaces";
import {
  selectAllSequences,
  findSequence
} from "../resources/selectors";
import { getStepTag } from "../resources/sequence_tagging";

export function mapStateToProps(props: Everything): Props {
  const uuid = props.resources.consumers.sequences.current;
  const sequence = uuid ? findSequence(props.resources.index, uuid) : undefined;
  sequence && (sequence.body.body || []).map(x => getStepTag(x));

  return {
    dispatch: props.dispatch,
    sequences: selectAllSequences(props.resources.index),
    sequence: sequence,
    auth: props.auth,
    resources: props.resources.index,
    syncStatus: (props
      .bot
      .hardware
      .informational_settings
      .sync_status || "unknown"),
    consistent: props.bot.consistent,
    autoSyncEnabled: !!props.bot.hardware.configuration.auto_sync
  };
}
