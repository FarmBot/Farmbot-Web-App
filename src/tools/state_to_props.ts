import { Everything } from "../interfaces";
import { Props } from "./interfaces";
import * as _ from "lodash";
import { NULL_CHOICE } from "../ui/fb_select";
import {
  selectAllToolSlotPointers,
  selectAllTools,
  currentToolInSlot,
} from "../resources/selectors";
import {
  isTaggedTool,
  TaggedTool,
  TaggedToolSlotPointer
} from "../resources/tagged_resources";
import { edit } from "../api/crud";
import { DropDownItem } from "../ui/index";

export function mapStateToProps(props: Everything): Props {
  let toolSlots = selectAllToolSlotPointers(props.resources.index);
  let tools = selectAllTools(props.resources.index);

  /** Returns sorted tool slots specific to the tool bay id passed. */
  let getToolSlots = (/** uuid: string */) => {
    // TODO: three things:
    //       1. We don't support multiple bays. Therefore, no need to filter.
    //       2. If we add an index to this resource, we don't need to perform
    //          filtering.
    //       3. Once we do support multiple bays, re-add the slot's UUID param.
    return toolSlots;
  };

  /** Returns all tools in an <FBSelect /> compatible format. */
  let getToolOptions = () => {
    return _(tools)
      .map(tool => ({ label: tool.body.name, value: (tool.body.id as number) }))
      .filter(ddi => _.isNumber(ddi.value))
      .compact()
      .value();
  };

  let activeTools = _(toolSlots).map(x => x.body.tool_id).compact().value();

  let isActive = (t: TaggedTool) => activeTools.includes(t.body.id);

  let getToolByToolSlotUUID = currentToolInSlot(props.resources.index);

  /** Returns the current tool chosen in a slot based off the slot's id
	 * and in an <FBSelect /> compatible format. */
  let getChosenToolOption = (toolSlotUUID: string | undefined) => {
    let chosenTool = toolSlotUUID && getToolByToolSlotUUID(toolSlotUUID);
    if (chosenTool && isTaggedTool(chosenTool) && chosenTool.body.id) {
      return { label: chosenTool.body.name, value: chosenTool.uuid };
    } else {
      return NULL_CHOICE;
    }
  };

  let changeToolSlot = (t: TaggedToolSlotPointer,
    dispatch: Function) =>
    (d: DropDownItem) => {
      // THIS IS IMPORTANT:
      // If you remove the `any`, the tool will be serialized wrong and
      // cause errors.
      let tool_id = d.value ? d.value : (null as any);
      dispatch(edit(t, { tool_id }));
    };

  return {
    toolSlots,
    tools,
    getToolSlots,
    getToolOptions,
    getChosenToolOption,
    getToolByToolSlotUUID,
    changeToolSlot,
    isActive,
    dispatch: _.noop
  };

}
