import { ResourceIndex } from "../../../resources/interfaces";
import {
  selectAllPoints,
  selectAllTools,
  mapToolIdToName
} from "../../../resources/selectors";
import { CowardlyDictionary } from "../../../util";
import { PointerTypeName } from "../../../interfaces";
import { PointerType, TaggedTool } from "../../../resources/tagged_resources";
import { DropDownItem } from "../../../ui/index";
import { Vector3 } from "farmbot/dist";
import { TOOL } from "./interfaces";
import * as _ from "lodash";

export function generateList(input: ResourceIndex): DropDownItem[] {
  let toolNameById = mapToolIdToName(input);
  let SORT_KEY: keyof DropDownItem = "headingId";
  let points = selectAllPoints(input)
    .filter(x => (x.body.pointer_type !== "ToolSlot"))
  let toolDDI = selectAllTools(input)
    .filter(x => !!x.body.id)
    .map(t => formatTools(t));
  return _(points)
    .map(formatPoint(toolNameById))
    .sortBy(SORT_KEY)
    .reverse()
    .concat(toolDDI)
    .filter(x => parseInt("" + x.value) > 0)
    .value();
}

export const NAME_MAP: Record<PointerTypeName, string> = {
  "GenericPointer": "Map Point",
  "Plant": "Plant",
  "ToolSlot": "Tool Slot",
};

let formatPoint = (toolNames: CowardlyDictionary<string>) =>
  (p: PointerType) => {
    let { id, pointer_type, name, x, y, z } = p.body;

    // Special formatting rules for tool slots
    if (p.body.pointer_type === "ToolSlot") {
      let tool = (p.body.tool_id && toolNames[p.body.tool_id]) || undefined;
      name = tool ? `using '${tool}'` : "no tool";
    }

    return {
      label: dropDownName(NAME_MAP[pointer_type], name, { x, y, z }),
      value: "" + id,
      headingId: pointer_type
    };
  };

let formatTools = (t: TaggedTool) => {
  let { id, name } = t.body;

  return {
    label: dropDownName("Tool", (name || "untitled")),
    value: "" + id,
    headingId: TOOL
  };
};

/** Uniformly generate a label for things that have an X/Y/Z value. */
export function dropDownName(kind: string, name: string, v?: Vector3) {
  let formattedKind = _.get(NAME_MAP, kind, kind);
  let label = `${formattedKind}: ${name || "untitled"}`;
  if (v) { label += ` (${v.x}, ${v.y}, ${v.z}) `; }
  return label;
}
