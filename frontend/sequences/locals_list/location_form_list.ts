import { ResourceIndex } from "../../resources/interfaces";
import {
  selectAllToolSlotPointers,
  selectAllActivePoints
} from "../../resources/selectors";
import { betterCompact } from "../../util";
import { TaggedTool, TaggedPoint } from "farmbot";
import { DropDownItem } from "../../ui";
import { Vector3 } from "farmbot/dist";
import { t } from "i18next";
import { capitalize } from "lodash";
import { joinKindAndId } from "../../resources/reducer_support";
import { Point } from "farmbot/dist/resources/api_resources";

const TOOL: "Tool" = "Tool";
type ToolAndLocation = { tool: TaggedTool, location: Vector3 };

/** Return tool and location for all tools currently in tool slots. */
export function activeTools(resources: ResourceIndex): ToolAndLocation[] {
  const Tool: TaggedTool["kind"] = "Tool";
  const slots = selectAllToolSlotPointers(resources);

  const { byKindAndId, references } = resources;
  return betterCompact(slots
    .map(x => ({
      tool: references[byKindAndId[joinKindAndId(Tool, x.body.tool_id)] || ""],
      location: { x: x.body.x, y: x.body.y, z: x.body.z }
    }))
    .map(({ tool, location }) => (tool && tool.kind === "Tool")
      ? { tool, location }
      : undefined));
}

type PointerTypeName = Point["pointer_type"];
type DropdownHeadingId = PointerTypeName | typeof TOOL | "Other";

/** Location selection menu section names. */
export const NAME_MAP: Record<DropdownHeadingId, string> = {
  "GenericPointer": "Map Points",
  "Plant": "Plants",
  "ToolSlot": "Tool Slots",
  "Tool": "Tools",
  "Other": "Other",
};

const heading = (name: DropdownHeadingId): DropDownItem[] => ([{
  label: t(NAME_MAP[name]),
  heading: true,
  value: 0,
  headingId: name
}]);

const ddiFrom = (points: TaggedPoint[], pointerType: PointerTypeName) => points
  .filter(x => x.body.pointer_type === pointerType)
  .map(formatPoint)
  .filter(x => parseInt("" + x.value) > 0);

const maybeGroup = (display: boolean) =>
  (groupDDI: DropDownItem): DropDownItem[] =>
    display ? [groupDDI] : [];

/** Location selection menu items. */
export function locationFormList(resources: ResourceIndex,
  additionalItems: DropDownItem[], displayGroups?: boolean): DropDownItem[] {
  const points = selectAllActivePoints(resources)
    .filter(x => x.body.pointer_type !== "ToolSlot");
  const plantDDI = ddiFrom(points, "Plant");
  const genericPointerDDI = ddiFrom(points, "GenericPointer");
  const toolDDI: DropDownItem[] = activeTools(resources)
    .map(({ tool, location }) => formatTools(tool, location))
    .filter(x => parseInt("" + x.value) > 0);
  const group = maybeGroup(!!displayGroups);
  return heading("Tool")
    .concat(toolDDI)
    .concat(group(everyPointDDI("Tool")))
    .concat(group(everyPointDDI("ToolSlot")))
    .concat(heading("Plant"))
    .concat(plantDDI)
    .concat(group(everyPointDDI("Plant")))
    .concat(heading("GenericPointer"))
    .concat(genericPointerDDI)
    .concat(group(everyPointDDI("GenericPointer")))
    .concat(heading("Other"))
    .concat(additionalItems)
    .concat(COORDINATE_DDI());
}

/** Create drop down item with label; i.e., "Point/Plant (1, 2, 3)" */
export const formatPoint = (p: TaggedPoint): DropDownItem => {
  const { id, name, pointer_type, x, y, z } = p.body;
  return {
    label: dropDownName(name, { x, y, z }),
    value: "" + id,
    headingId: pointer_type
  };
};

/** Create drop down item with label; i.e., "Tool (1, 2, 3)" */
const formatTools = (tool: TaggedTool, v: Vector3): DropDownItem => {
  const { id, name } = tool.body;
  return {
    label: dropDownName((name || "untitled"), v),
    value: "" + id,
    headingId: TOOL
  };
};

/** Uniformly generate a label for things that have an X/Y/Z value. */
export function dropDownName(name: string, v?: Vector3) {
  let label = name || "untitled";
  if (v) { label += ` (${v.x}, ${v.y}, ${v.z})`; }
  return capitalize(label);
}

export const EVERY_POINT_LABEL = {
  "Plant": "All plants",
  "GenericPointer": "All map points",
  "Tool": "All tools",
  "ToolSlot": "All tool slots",
};

export type EveryPointType = keyof typeof EVERY_POINT_LABEL;

const isEveryPointType = (x: string): x is EveryPointType =>
  Object.keys(EVERY_POINT_LABEL).includes(x);

export const safeEveryPointType = (x: string): EveryPointType => {
  if (isEveryPointType(x)) {
    return x;
  } else {
    throw new Error(`'${x}' is not of type EveryPointType`);
  }
};

export const everyPointDDI = (value: EveryPointType): DropDownItem =>
  ({ value, label: t(EVERY_POINT_LABEL[value]), headingId: "every_point" });

const COORDINATE_DDI = (): DropDownItem =>
  ({ value: "", label: t("Coordinate"), headingId: "Coordinate" });

export const NO_VALUE_SELECTED_DDI = (): DropDownItem =>
  ({ label: t("Select a location"), value: "", isNull: true });
