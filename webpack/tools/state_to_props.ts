import { Everything } from "../interfaces";
import { Props } from "./interfaces";
import * as _ from "lodash";
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
import { DropDownItem, NULL_CHOICE } from "../ui/index";
import { validBotLocationData } from "../util";

export function mapStateToProps(props: Everything): Props {
  const toolSlots = selectAllToolSlotPointers(props.resources.index);
  const tools = selectAllTools(props.resources.index);

  /** Returns sorted tool slots specific to the tool bay id passed. */
  const getToolSlots = () => toolSlots;

  /** Returns all tools in an <FBSelect /> compatible format. */
  const getToolOptions = () => {
    return _(tools)
      .map(tool => ({ label: tool.body.name || "untitled", value: (tool.body.id as number) }))
      .filter(ddi => _.isNumber(ddi.value))
      .compact()
      .value();
  };

  const activeTools = _(toolSlots).map(x => x.body.tool_id).compact().value();

  const isActive =
    (t: TaggedTool) => !!(t.body.id && activeTools.includes(t.body.id));

  const getToolByToolSlotUUID = currentToolInSlot(props.resources.index);

  /** Returns the current tool chosen in a slot based off the slot's id
	 * and in an <FBSelect /> compatible format. */
  const getChosenToolOption = (toolSlotUUID: string | undefined) => {
    const chosenTool = toolSlotUUID && getToolByToolSlotUUID(toolSlotUUID);
    if (chosenTool && isTaggedTool(chosenTool) && chosenTool.body.id) {
      return { label: chosenTool.body.name || "untitled", value: chosenTool.uuid };
    } else {
      return NULL_CHOICE;
    }
  };

  const changeToolSlot = (t: TaggedToolSlotPointer,
    dispatch: Function) =>
    (d: DropDownItem) => {
      // THIS IS IMPORTANT:
      // If you remove the `any`, the tool will be serialized wrong and
      // cause errors.
      // tslint:disable-next-line:no-null-keyword no-any
      const tool_id = d.value ? d.value : (null as any);
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
    dispatch: _.noop,
    botPosition: validBotLocationData(props.bot.hardware.location_data).position
  };

}
