import { ResourceIndex } from "../../../resources/interfaces";
import { LocationData } from "./interfaces";
import { NULL_CHOICE, DropDownItem } from "../../../ui/index";
import { dropDownName, PARENT_DDI } from "./generate_list";
import {
  findToolById,
  findPointerByTypeAndId
} from "../../../resources/selectors";
import { Point, Tool } from "farmbot/dist";

export function formatSelectedDropdown(
  ri: ResourceIndex, ld: LocationData): DropDownItem {
  switch (ld.kind) {
    case "tool": return tool(ri, ld);
    case "point": return point(ri, ld);
    case "identifier": return PARENT_DDI[0];
    case "coordinate":
    default:
      return other();
  }
}

function tool(ri: ResourceIndex, ld: Tool): DropDownItem {
  const t = findToolById(ri, ld.args.tool_id).body;
  const label = dropDownName(t.name || "untitled");
  return { label, value: t.id || -999 };
}

function point(ri: ResourceIndex, ld: Point): DropDownItem {
  const p =
    findPointerByTypeAndId(ri, ld.args.pointer_type, ld.args.pointer_id).body;
  const label = dropDownName(p.name, { x: p.x, y: p.y, z: p.z });
  return { label, value: p.id || -999 };
}

function other() { return NULL_CHOICE; }
