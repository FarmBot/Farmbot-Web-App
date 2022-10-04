import { ResourceIndex, TaggedPointGroup } from "../../resources/interfaces";
import {
  selectAllToolSlotPointers,
  selectAllActivePoints,
  maybeFindToolById,
  selectAllPointGroups,
} from "../../resources/selectors";
import { betterCompact } from "../../util";
import {
  TaggedTool, TaggedPoint, TaggedToolSlotPointer, Xyz, Vector3,
  TaggedSequence,
  TaggedPeripheral,
  TaggedSensor,
} from "farmbot";
import { DropDownItem } from "../../ui";
import { capitalize, isNumber, sortBy } from "lodash";
import { Point } from "farmbot/dist/resources/api_resources";
import { t } from "../../i18next_wrapper";
import { SequenceMeta } from "../../resources/sequence_meta";
import { VariableType } from "./locals_list_support";

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
  | "Tool"
  | "PointGroup"
  | "Variable"
  | "Identifier"
  | "Sequence"
  | "Other";

/** Variable selection menu section names. */
const NAME_MAP: Record<DropdownHeadingId, string> = {
  "Variable": "Variables",
  "Identifier": "Variables",
  "GenericPointer": "Map Points",
  "Plant": "Plants",
  "ToolSlot": "Slots",
  "Tool": "Tools and Seed Containers",
  "PointGroup": "Groups",
  "Weed": "Weeds",
  "Sequence": "Sequence",
  "Other": "Other",
};

export const heading = (headingId: DropdownHeadingId): DropDownItem[] => ([{
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

export const groups2Ddi = (
  groups: TaggedPointGroup[],
): DropDownItem[] => {
  return groups
    .filter(group => group.body.id)
    .map(group => {
      const count = group.body.member_count || 0;
      const label = `${group.body.name} (${count})`;
      return { label, value: "" + group.body.id, headingId: "PointGroup" };
    });
};

export const sequences2Ddi = (sequences: TaggedSequence[]): DropDownItem[] => {
  return sequences
    .filter(x => x.body.id)
    .map(x => {
      return { label: x.body.name, value: "" + x.body.id, headingId: "Sequence" };
    });
};

export const peripherals2Ddi =
  (peripherals: TaggedPeripheral[]): DropDownItem[] =>
    peripherals
      .filter(x => x.body.id)
      .map(x => ({
        label: x.body.label,
        value: "" + x.body.id,
        headingId: "Peripheral"
      }));

export const sensors2Ddi =
  (sensors: TaggedSensor[]): DropDownItem[] =>
    sensors
      .filter(x => x.body.id)
      .map(x => ({
        label: x.body.label,
        value: "" + x.body.id,
        headingId: "Sensor"
      }));

/** Variable and location selection menu items. */
export function variableFormList(
  resources: ResourceIndex,
  additionalItems: DropDownItem[],
  variableItems?: DropDownItem[],
  displayGroups?: boolean,
  variableType?: VariableType,
): DropDownItem[] {
  const allPoints = selectAllActivePoints(resources);
  const plantDDI = points2ddi(allPoints, "Plant");
  const genericPointerDDI = points2ddi(allPoints, "GenericPointer");
  const weedDDI = points2ddi(allPoints, "Weed");
  const toolDDI = activeToolDDIs(resources);
  const addItems = additionalItems
    .concat((variableItems && variableItems.length > 0)
      ? heading((variableItems[0].headingId as DropdownHeadingId) || "Variable")
      : [])
    .concat(variableItems || []);
  if (variableType == VariableType.Number) {
    return [NUMBER_DDI()].concat(addItems);
  }
  if (variableType == VariableType.Text) {
    return [TEXT_DDI()].concat(addItems);
  }
  if (variableType == VariableType.Resource) {
    return [];
  }
  const allGroups = selectAllPointGroups(resources);
  return [COORDINATE_DDI()]
    .concat(addItems)
    .concat(heading("Tool"))
    .concat(toolDDI)
    .concat(displayGroups ? heading("PointGroup") : [])
    .concat(displayGroups ? groups2Ddi(allGroups) : [])
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
      headingId: "Tool",
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
    : t("Custom coordinates"),
  value: vector ? JSON.stringify(vector) : "",
  headingId: "Coordinate"
});

const NUMBER_DDI = (): DropDownItem =>
  ({ label: t("Custom number"), value: 0, headingId: "Numeric" });

const TEXT_DDI = (): DropDownItem =>
  ({ label: t("Custom text"), value: "", headingId: "Text" });

export const NO_VALUE_SELECTED_DDI = (): DropDownItem =>
  ({ label: t("Select a location"), value: "", isNull: true });

export const LOCATION_PLACEHOLDER_DDI = (): DropDownItem =>
  ({ label: t("None"), value: "", headingId: "Location" });

export const sortVariables = (variables: (SequenceMeta | undefined)[]) =>
  sortBy(betterCompact(variables),
    v => v.celeryNode.args.label == "parent"
      ? t("Location")
      : v.celeryNode.args.label);
