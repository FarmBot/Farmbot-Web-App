import { Everything } from "../interfaces";
import { Props } from "./interfaces";
import {
  selectAllSequences,
  findSequence,
  selectAllToolSlotPointers
} from "../resources/selectors";
import { getStepTag } from "../resources/sequence_tagging";
import { TaggedTool } from "../resources/tagged_resources";
import { joinKindAndId } from "../resources/reducer";
import { betterCompact } from "../util";

export function mapStateToProps(props: Everything): Props {
  const uuid = props.resources.consumers.sequences.current;
  const syncStatus = props
    .bot
    .hardware
    .informational_settings
    .sync_status || "unknown";
  const sequence = uuid ? findSequence(props.resources.index, uuid) : undefined;
  sequence && (sequence.body.body || []).map(x => getStepTag(x));
  const Tool: TaggedTool["kind"] = "Tool";
  const slots = selectAllToolSlotPointers(props.resources.index);

  const { byKindAndId, references } = props.resources.index;
  const tools = betterCompact(slots
    .map(x => references[byKindAndId[joinKindAndId(Tool, x.body.tool_id)] || ""])
    .map(tool => (tool && tool.kind === "Tool") ? tool : undefined));

  return {
    dispatch: props.dispatch,
    sequences: selectAllSequences(props.resources.index),
    tools,
    slots,
    sequence: sequence,
    auth: props.auth,
    resources: props.resources.index,
    syncStatus,
    consistent: props.bot.consistent,
    autoSyncEnabled: !!props.bot.hardware.configuration.auto_sync
  };
}
