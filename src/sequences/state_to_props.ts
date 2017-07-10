import { Everything } from "../interfaces";
import { Props } from "./interfaces";
import {
  selectAllSequences,
  selectAllTools,
  findSequence,
  selectAllToolSlotPointers
} from "../resources/selectors";
import { TaggedSequence } from "../resources/tagged_resources";
import { defensiveClone } from "../util";
import { uuid as _uuid } from "farmbot/dist";
import { set } from "lodash";

export function mapStateToProps(props: Everything): Props {
  let uuid = props.resources.consumers.sequences.current;
  let syncStatus =
    props.bot.hardware.informational_settings.sync_status || "unknown";
  let sequence =
    (uuid) ? findSequence(props.resources.index, uuid) : undefined;
  return {
    dispatch: props.dispatch,
    sequences: selectAllSequences(props.resources.index),
    tools: selectAllTools(props.resources.index),
    slots: selectAllToolSlotPointers(props.resources.index),
    sequence: sequenceFix(sequence),
    auth: props.auth,
    resources: props.resources.index,
    syncStatus
  };
}

/** CeleryScript nodes are hard to keep track of in the sequence editor because
 * there is so much splicing/shuffling/pushing/poping of body elements.
 * React can't keep track of changes via `index` alone. */
export function sequenceFix(s?: TaggedSequence):
  TaggedSequence | undefined {
  if (s) {
    let fixedSequence = defensiveClone(s);
    (fixedSequence.body.body || [])
      .map(x => set(x, "uuid", _uuid()));
    return fixedSequence;
  }
}
