import { ResourceIndex } from "../../resources/interfaces";
import {
  selectAllToolSlotPointers,
  selectAllActivePoints,
  maybeFindToolById,
  selectAllPointGroups,
} from "../../resources/selectors";
import { betterCompact } from "../../util";
import {
  TaggedTool, TaggedPoint, TaggedToolSlotPointer, Xyz, Vector3, TaggedPointGroup,
} from "farmbot";
import { DropDownItem } from "../../ui";
import { capitalize, isNumber } from "lodash";
import { Point } from "farmbot/dist/resources/api_resources";
import { t } from "../../i18next_wrapper";

const TOOL: "Tool" = "Tool";

/** Return tool and location for all tools currently in tool slots. */
export function activeToolDDIs(resources: ResourceIndex): DropDownItem[] {
  const slots = selectAllToolSlotPointers(resources);
  return betterCompact(slots
    .map(slot => {
      const tool = maybeFindToolById(resources, slot.body.tool_id);
      if (tool) { return formatTool(tool, slot); }
    }))
    .filter(x => parseInt("" + x.value) > 0);
}

type PointerTypeName = Point["pointer_type"];
type DropdownHeadingId =
  | PointerTypeName
  | typeof TOOL
  | "PointGroup"
  | "Other";

/** Location selection menu section names. */
export const NAME_MAP: Record<DropdownHeadingId, string> = {
  "GenericPointer": "Map Points",
  "Plant": "Plants",
  "ToolSlot": "Slots",
  "Tool": "Tools and Seed Containers",
  "PointGroup": "Groups",
  "Weed": "Weeds",
  "Other": "Other",
};

const heading = (headingId: DropdownHeadingId): DropDownItem[] => ([{
  label: t(NAME_MAP[headingId]),
  heading: true,
  value: 0,
  headingId: headingId
}]);

const points2ddi = (allPoints: TaggedPoint[], pointerType: PointerTypeName) =>
  allPoints
    .filter(x => x.body.pointer_type === pointerType)
    .map(formatPoint)
    .filter(x => parseInt("" + x.value) > 0);

export const groups2Ddi = (groups: TaggedPointGroup[]): DropDownItem[] => {
  return groups
    .filter(x => x.body.id)
    .map(x => {
      return { label: x.body.name, value: "" + x.body.id, headingId: "PointGroup" };
    });
};

/** Location selection menu items. */
export function locationFormList(resources: ResourceIndex,
  additionalItems: DropDownItem[], displayGroups?: boolean): DropDownItem[] {
  const allPoints = selectAllActivePoints(resources);
  const plantDDI = points2ddi(allPoints, "Plant");
  const genericPointerDDI = points2ddi(allPoints, "GenericPointer");
  const weedDDI = points2ddi(allPoints, "Weed");
  const toolDDI = activeToolDDIs(resources);
  return [COORDINATE_DDI()]
    .concat(additionalItems)
    .concat(heading("Tool"))
    .concat(toolDDI)
    .concat(displayGroups ? heading("PointGroup") : [])
    .concat(displayGroups ? groups2Ddi(selectAllPointGroups(resources)) : [])
    .concat(heading("Plant"))
    .concat(plantDDI)
    .concat(heading("GenericPointer"))
    .concat(genericPointerDDI)
    .concat(heading("Weed"))
    .concat(weedDDI);
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
export const formatTool =
  (tool: TaggedTool, slot: TaggedToolSlotPointer | undefined): DropDownItem => {
    const { id, name } = tool.body;
    const coordinate = slot
      ? {
        x: slot.body.x,
        y: slot.body.y,
        z: slot.body.z
      }
      : undefined;
    const gantryMounted = !!slot?.body.gantry_mounted;
    return {
      label: dropDownName((name || "Untitled tool"), coordinate, gantryMounted),
      value: "" + id,
      headingId: TOOL
    };
  };

/** Uniformly generate a label for things that have an X/Y/Z value. */
export function dropDownName(name: string, v?: Record<Xyz, number | undefined>,
  gantryMounted = false) {
  let label = name || "untitled";
  if (v) {
    const labelFor = (axis: number | undefined) => isNumber(axis) ? axis : "---";
    const xLabel = gantryMounted ? t("Gantry") : labelFor(v.x);
    label += ` (${xLabel}, ${labelFor(v.y)}, ${labelFor(v.z)})`;
  }
  return capitalize(label);
}

export const COORDINATE_DDI = (vector?: Vector3): DropDownItem => ({
  label: vector
    ? `${t("Coordinate")} (${vector.x}, ${vector.y}, ${vector.z})`
    : t("Custom Coordinates"),
  value: vector ? JSON.stringify(vector) : "",
  headingId: "Coordinate"
});

export const NO_VALUE_SELECTED_DDI = (): DropDownItem =>
  ({ label: t("Select a location"), value: "", isNull: true });
