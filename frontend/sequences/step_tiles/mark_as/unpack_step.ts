import { DropDownItem } from "../../../ui";
import {
  findToolById,
  findPointerByTypeAndId,
} from "../../../resources/selectors";
import { point2ddi } from "./resource_list";
import { MOUNTED_TO } from "./constants";
import {
  DropDownPair, PackedStepWithResourceIndex, UnpackedStepWithResourceIndex,
} from "./interfaces";
import { t } from "../../../i18next_wrapper";
import {
  PLANT_STAGE_DDI_LOOKUP,
} from "../../../farm_designer/plants/edit_plant_status";

export const TOOL_MOUNT = (): DropDownItem => ({
  label: t("Tool Mount"), value: "tool_mount"
});
const NOT_IN_USE = (): DropDownItem => ({ label: t("Not Mounted"), value: 0 });
export const DISMOUNTED = (): DropDownPair => ({
  leftSide: TOOL_MOUNT(),
  rightSide: NOT_IN_USE()
});
const DEFAULT_TOOL_NAME = () => t("Untitled Tool");

const mountedTo = (toolName = DEFAULT_TOOL_NAME()): DropDownItem =>
  ({ label: `${MOUNTED_TO()} ${toolName}`, value: "mounted" });

/** The user wants to change the `mounted_tool_id` of their Device. */
function mountTool(i: UnpackedStepWithResourceIndex): DropDownPair {
  const { value } = i;
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
function unknownOption(i: UnpackedStepWithResourceIndex): DropDownPair {
  const { resource } = i;
  const resource_type =
    resource.kind == "resource" ? resource.args.resource_type : "variable";
  const resource_id =
    resource.kind == "resource" ? resource.args.resource_id : 0;
  const { field, value } = i;
  const leftLabel = `${resource_type} ${resource_id} ${field}`;
  return {
    leftSide: { label: leftLabel, value: field },
    rightSide: { label: "" + value, value: "" + value }
  };
}

/** The user wants to mark a the `plant_stage` attribute of a Plant resource. */
function plantStage(i: UnpackedStepWithResourceIndex): DropDownPair {
  const { resource } = i;
  const resource_type =
    resource.kind == "resource" ? resource.args.resource_type : "";
  const resource_id =
    resource.kind == "resource" ? resource.args.resource_id : 0;
  const { value } = i;
  const leftSide = resource.kind == "resource"
    ? point2ddi(findPointerByTypeAndId(
      i.resourceIndex, resource_type, resource_id).body)
    : { label: "" + resource.args.label, value: "" + resource.args.label };
  return {
    leftSide,
    rightSide: PLANT_STAGE_DDI_LOOKUP()["" + value]
      || { label: "" + value, value: "" + value },
  };
}

/** We can guess how the "Mark As.." UI will be rendered (left and right side
 * drop downs) based on the shape of the current step. There are several
 * strategies and this function will dispatch the appropriate one. */
export function unpackStep(p: PackedStepWithResourceIndex): DropDownPair {
  const { resource } = p.step.args;
  const { label, value } = p.step.body?.[0]?.args || { label: "", value: "" };
  const field = label;
  const unpacked = { resourceIndex: p.resourceIndex, resource, field, value };
  switch (field) {
    case "mounted_tool_id": return mountTool(unpacked);
    case "plant_stage": return plantStage(unpacked);
    default: return unknownOption(unpacked);
  }
}
