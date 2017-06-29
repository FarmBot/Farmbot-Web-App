import { ResourceIndex } from "../../../resources/interfaces";
import { LocationData } from "./interfaces";
import { NULL_CHOICE } from "../../../ui/index";
import { dropDownName } from "./generate_list";
import {
  findToolById,
  findPointerByTypeAndId,
  findToolBySlotId
} from "../../../resources/selectors";
import { DropDownItem } from "../../../ui/fb_select";
import { Point, Tool } from "farmbot/dist";

export function formatSelectedDropdown(ri: ResourceIndex, ld: LocationData): DropDownItem {
  switch (ld.kind) {
    case "tool": return toolbar(ri, ld);
    case "point": return point(ri, ld);
    case "coordinate": default: return other();
  }
}

function toolbar(ri: ResourceIndex, ld: Tool): DropDownItem {
  let tool = findToolById(ri, ld.args.tool_id).body;
  let label = dropDownName("Tool", tool.name);
  return { label, value: tool.id || -999 }
}

function point(ri: ResourceIndex, ld: Point): DropDownItem {
  let p =
    findPointerByTypeAndId(ri, ld.args.pointer_type, ld.args.pointer_id).body;
  let label: string;
  switch (p.pointer_type) {
    case "ToolSlot":
      let tool = p.tool_id && findToolBySlotId(ri, p.tool_id);
      label = dropDownName(p.pointer_type,
        tool ? ("using " + tool.body.name) : "no tool",
        { x: p.x, y: p.y, z: p.z });
      break;
    default:
      label = dropDownName(p.pointer_type, p.name, { x: p.x, y: p.y, z: p.z });
      break;
  }
  return { label, value: p.id || -999 }
}

function other() { return NULL_CHOICE; }
