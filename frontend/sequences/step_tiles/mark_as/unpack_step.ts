import { DropDownItem } from "../../../ui";
import {
  findToolById,
  findByKindAndId,
  findPointerByTypeAndId
} from "../../../resources/selectors";
import { plant2ddi, pointer2ddi } from "./resource_list";
import { GenericPointer } from "farmbot/dist/resources/api_resources";
import { MOUNTED_TO } from "./constants";
import { DropDownPair, StepWithResourceIndex } from "./interfaces";
import { TaggedPoint, TaggedPlantPointer } from "farmbot";
import { t } from "../../../i18next_wrapper";

export const TOOL_MOUNT = (): DropDownItem => ({
  label: t("Tool Mount"), value: "tool_mount"
});
const NOT_IN_USE = (): DropDownItem => ({ label: t("Not Mounted"), value: 0 });
export const DISMOUNTED = (): DropDownPair => ({
  leftSide: TOOL_MOUNT(),
  rightSide: NOT_IN_USE()
});
const DEFAULT_TOOL_NAME = "Untitled Tool";
const REMOVED_ACTION = { label: "Removed", value: "removed" };

const mountedTo = (name = DEFAULT_TOOL_NAME): DropDownItem =>
  ({ label: `${MOUNTED_TO} ${name}`, value: "mounted" });

/** The user wants to change the `mounted_tool_id` of their Device. */
function mountTool(i: StepWithResourceIndex): DropDownPair {
  const { value } = i.step.args;
  if (typeof value === "number" && value > 0) {
    try { // Good tool id
      const tool = findToolById(i.resourceIndex, value as number);
      return { leftSide: TOOL_MOUNT(), rightSide: mountedTo(tool.body.name) };
    } catch { // Bad tool ID or app still loading.
      return { leftSide: TOOL_MOUNT(), rightSide: mountedTo("an unknown tool") };
    }
  } else {
    // No tool id
    return DISMOUNTED();
  }
}

/** When we can't properly guess the correct way to to render the screen,
 * possibly for legacy reasons or because the user wrote their CeleryScript by
 * hand. */
function unknownOption(i: StepWithResourceIndex): DropDownPair {
  const { resource_type, resource_id, label, value } = i.step.args;

  return {
    leftSide: { label: resource_type, value: resource_id },
    rightSide: { label: `${label} = ${value}`, value: "" + value }
  };
}

/** The user wants to mark a the `discarded_at` attribute of a Point. */
function discardPoint(i: StepWithResourceIndex): DropDownPair {
  const { resource_id } = i.step.args;
  const genericPointerBody =
    findPointerByTypeAndId(i.resourceIndex, "GenericPointer", resource_id).body;
  return {
    leftSide: pointer2ddi(genericPointerBody as GenericPointer),
    rightSide: REMOVED_ACTION
  };
}

/** The user wants to mark a the `plant_stage` attribute of a Plant resource. */
function plantStage(i: StepWithResourceIndex): DropDownPair {
  const { resource_id, value } = i.step.args;
  const r: TaggedPoint = findByKindAndId(i.resourceIndex, "Point", resource_id);

  return {
    leftSide: plant2ddi(r.body as TaggedPlantPointer["body"]),
    rightSide: { label: ("" + value), value: ("" + value) }
  };
}

/** We can guess how the "Mark As.." UI will be rendered (left and right side
 * drop downs) based on the shape of the current step. There are several
 * strategies and this function will dispatch the appropriate one. */
export function unpackStep(i: StepWithResourceIndex): DropDownPair {
  const { label } = i.step.args;
  switch (label) {
    case "mounted_tool_id": return mountTool(i);
    case "discarded_at": return discardPoint(i);
    case "plant_stage": return plantStage(i);
    default: return unknownOption(i);
  }
}
