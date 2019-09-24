/** Given a drop down item and a ResourceIndex,
 * figures out the corresponding Tool | Coordinate | Point */
import { DropDownItem } from "../../ui";
import {
  Coordinate,
  ScopeDeclaration,
  ParameterApplication,
  Dictionary,
  Identifier,
  Point,
  Tool,
  ScopeDeclarationBodyItem,
  VariableDeclaration,
  PointType,
  EveryPoint,
  PointGroup,
} from "farmbot";
import { VariableNode, AllowedVariableNodes } from "./locals_list_support";
import { betterCompact } from "../../util";

/**
 * Empty `data_value` for location form initial state.
 * This is specifically an invalid parameter application data value to force the
 * user to make a valid selection to successfully save the parameter application.
 */
// tslint:disable-next-line:no-any
export const NOTHING_SELECTED: any = { kind: "nothing", args: {} };

type DataValue =
  | Coordinate
  | EveryPoint
  | Identifier
  | Point
  | PointGroup
  | Tool;

type CreateVariableDeclaration =
  (label: string, data_value: DataValue) => VariableDeclaration;

type CreateParameterApplication =
  (label: string, data_value: DataValue) => ParameterApplication;

type VariableWithAValue = VariableDeclaration | ParameterApplication;

const createVariableNode = (allowedNodes: AllowedVariableNodes):
  CreateParameterApplication | CreateVariableDeclaration =>
  allowedNodes == AllowedVariableNodes.parameter
    ? createVariableDeclaration
    : createParameterApplication;

const createParameterApplication =
  (label: string, data_value: DataValue): ParameterApplication =>
    ({
      kind: "parameter_application",
      args: { label, data_value }
    });

const createVariableDeclaration =
  (label: string, data_value: DataValue): VariableDeclaration =>
    ({
      kind: "variable_declaration",
      args: { label, data_value }
    });

interface NewVarProps {
  label: string;
  allowedVariableNodes: AllowedVariableNodes;
}

const nothingVar =
  ({ label, allowedVariableNodes }: NewVarProps): VariableWithAValue =>
    createVariableNode(allowedVariableNodes)(label, NOTHING_SELECTED);

const toolVar = (value: string | number) =>
  ({ label, allowedVariableNodes }: NewVarProps): VariableWithAValue =>
    createVariableNode(allowedVariableNodes)(label, {
      kind: "tool",
      args: { tool_id: parseInt("" + value) }
    });

const pointVar = (
  pointer_type: "Plant" | "GenericPointer",
  value: string | number
) => ({ label, allowedVariableNodes }: NewVarProps): VariableWithAValue =>
    createVariableNode(allowedVariableNodes)(label, {
      kind: "point",
      args: { pointer_type, pointer_id: parseInt("" + value) }
    });

const everyPointVar = (value: string | number) =>
  ({ label, allowedVariableNodes }: NewVarProps): VariableWithAValue =>
    createVariableNode(allowedVariableNodes)(label, {
      kind: "every_point",
      args: { every_point_type: "" + value as PointType }
    });

const manualEntry = (value: string | number) =>
  ({ label, allowedVariableNodes }: NewVarProps): VariableWithAValue =>
    createVariableNode(allowedVariableNodes)(label, {
      kind: "coordinate",
      args: value ? JSON.parse("" + value) : { x: 0, y: 0, z: 0 }
    });

interface NewVariableProps extends NewVarProps {
  newVarLabel?: string;
}

/**
 * Create a parameter declaration or a parameter application containing an
 *    identifier.
 */
export const newParameter =
  ({ label, newVarLabel, allowedVariableNodes }: NewVariableProps):
    VariableNode =>
    (allowedVariableNodes === AllowedVariableNodes.identifier && newVarLabel)
      // Create a new variable (reassignment)
      ? createParameterApplication(label,
        { kind: "identifier", args: { label: newVarLabel } })
      : { // Unassign variable (will not create a new variable name)
        kind: "parameter_declaration",
        args: { label, default_value: NOTHING_SELECTED }
      };

/** Create a variable based on the dropdown heading ID. */
const newVariableCreator = (ddi: DropDownItem):
  (props: NewVariableProps) => VariableNode | undefined => {
  if (ddi.isNull) { return nothingVar; } // Empty form. Nothing selected yet.
  switch (ddi.headingId) {
    case "Plant":
    case "GenericPointer": return pointVar(ddi.headingId, ddi.value);
    case "Tool": return toolVar(ddi.value);
    case "parameter": return newParameter; // Caller decides X/Y/Z
    case "every_point": return everyPointVar(ddi.value);
    case "Coordinate": return manualEntry(ddi.value);
    case "point_group": throw new Error("TODO");
  }
  return () => undefined;
};

/** Convert a drop down selection to a variable. */
export const convertDDItoVariable =
  ({ label, allowedVariableNodes }: NewVarProps) =>
    (ddi: DropDownItem): VariableNode | undefined => {
      const newVarLabel =
        ddi.headingId === "parameter" ? "" + ddi.value : undefined;
      return newVariableCreator(ddi)({ label, newVarLabel, allowedVariableNodes });
    };

export const isScopeDeclarationBodyItem =
  (x: VariableNode): x is ScopeDeclarationBodyItem =>
    x.kind === "parameter_declaration" || x.kind === "variable_declaration";

/** Add a new variable or replace an existing one with the same label (regimens). */
export const addOrEditBodyVariables = (
  bodyVariables: VariableNode[],
  updatedItem: ScopeDeclarationBodyItem
): ScopeDeclarationBodyItem[] => {
  const filteredVariables: ScopeDeclarationBodyItem[] =
    betterCompact(bodyVariables.map(v =>
      isScopeDeclarationBodyItem(v) ? v : undefined));
  const items = reduceScopeDeclaration(filteredVariables);
  items[updatedItem.args.label] = updatedItem;
  return Object.values(items);
};

/** Add a new declaration or replace an existing one with the same label. (sequences) */
export const addOrEditDeclarationLocals = (
  declarations: ScopeDeclarationBodyItem[],
  updatedItem: ScopeDeclarationBodyItem
): ScopeDeclaration => {
  const updatedDeclarations = addOrEditBodyVariables(declarations, updatedItem);
  const newLocals: ScopeDeclaration = {
    kind: "scope_declaration",
    args: {},
    body: Object.values(updatedDeclarations)
  };
  return newLocals;
};

/** Convert scope declaration body items to a dictionary for lookup purposes. */
const reduceScopeDeclaration = (declarations: ScopeDeclarationBodyItem[]):
  Dictionary<ScopeDeclarationBodyItem> => {
  const items: Dictionary<ScopeDeclarationBodyItem> = {};
  declarations.map(d => items[d.args.label] = d);
  return items;
};
