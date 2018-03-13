import { ResourceIndex } from "../../../resources/interfaces";
import { LocationData } from "./interfaces";
import { NULL_CHOICE, DropDownItem } from "../../../ui/index";
import { dropDownName, PARENT_DDI } from "./generate_list";
import {
  findToolById,
  findPointerByTypeAndId,
  maybeFindToolById
} from "../../../resources/selectors";
import { Point, Tool } from "farmbot/dist";

export function formatSelectedDropdown(ri: ResourceIndex, ld: LocationData): DropDownItem {
  switch (ld.kind) {
    case "tool": return toolbar(ri, ld);
    case "point": return point(ri, ld);
    case "identifier": return PARENT_DDI[0];
    case "coordinate":
    default:
      return other();
  }
}

function toolbar(ri: ResourceIndex, ld: Tool): DropDownItem {
  const tool = findToolById(ri, ld.args.tool_id).body;
  const label = dropDownName("Tool", tool.name || "untitled");
  return { label, value: tool.id || -999 };
}

function point(ri: ResourceIndex, ld: Point): DropDownItem {
  const p =
    findPointerByTypeAndId(ri, ld.args.pointer_type, ld.args.pointer_id).body;
  let label: string;
  switch (p.pointer_type) {
    case "ToolSlot":
      const tool = maybeFindToolById(ri, p.tool_id);
      label = dropDownName(p.pointer_type,
        tool ? ("using " + tool.body.name) : "no tool",
        { x: p.x, y: p.y, z: p.z });
      break;
    default:
      label = dropDownName(p.pointer_type, p.name, { x: p.x, y: p.y, z: p.z });
      break;
  }
  return { label, value: p.id || -999 };
}

function other() { return NULL_CHOICE; }
