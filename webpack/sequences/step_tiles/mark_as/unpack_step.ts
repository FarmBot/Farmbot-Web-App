import { ResourceUpdate } from "farmbot";
import { DropDownItem } from "../../../ui";
import { ResourceIndex } from "../../../resources/interfaces";
import { findToolById } from "../../../resources/selectors";
import { point2ddi } from "../tile_move_absolute/format_selected_dropdown";

interface InputData { step: ResourceUpdate; resourceIndex: ResourceIndex; }
interface OutputData { resource: DropDownItem; action: DropDownItem; }

const TOOL_MOUNT: DropDownItem = { label: "Tool Mount", value: "tool_mount" };
const NOT_IN_USE: DropDownItem = { label: "Not in use", value: "dismounted" };
const DISMOUNTED: OutputData = { resource: TOOL_MOUNT, action: NOT_IN_USE };
const DEFAULT_TOOL_NAME = "Untitled Tool";
const REMOVED_ACTION = { label: "Removed", value: "removed" };

const mountedTo = (name = DEFAULT_TOOL_NAME): DropDownItem =>
  ({ label: `mounted to '${name}'`, value: "mounted" });

function mountTool(i: InputData): OutputData {
  const tool = findToolById(i.resourceIndex, i.step.args.resource_id);
  return { resource: TOOL_MOUNT, action: mountedTo(tool.body.name) };
}

function unknownOption(i: InputData): OutputData {
  const r = `${i.step.args.resource_type}#${i.step.args.resource_id}`;
  const a = `${i.step.args.label} = ${i.step.args.value}`;

  return { resource: { label: r, value: r }, action: { label: a, value: a } };
}

function discardPoint(i: InputData): OutputData {
  const { resource_type, resource_id } = i.step.args;

  return {
    resource: point2ddi(i.resourceIndex, {
      pointer_type: resource_type,
      pointer_id: resource_id
    }),
    action: REMOVED_ACTION
  };
}

function plantStage(i: InputData): OutputData {
  return unknownOption(i);
}

export function unpackStep(i: InputData): OutputData {
  const { label, resource_id } = i.step.args;
  switch (label) {
    case "mounted_tool_id":
      return resource_id && (resource_id > 0) ? mountTool(i) : DISMOUNTED;
    case "discarded_at": return discardPoint(i);
    case "plant_stage": return plantStage(i);
    default:
      return unknownOption(i);
  }
}
