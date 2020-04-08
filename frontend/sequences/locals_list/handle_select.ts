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
  identifierLabel: string;
  allowedVariableNodes: AllowedVariableNodes;
  dropdown: DropDownItem;
  newVarLabel?: string;
}

const nothingVar =
  ({ identifierLabel: label, allowedVariableNodes }: NewVarProps): VariableWithAValue =>
    createVariableNode(allowedVariableNodes)(label, NOTHING_SELECTED);

const toolVar = (value: string | number) =>
  ({ identifierLabel: label, allowedVariableNodes }: NewVarProps): VariableWithAValue =>
    createVariableNode(allowedVariableNodes)(label, {
      kind: "tool",
      args: { tool_id: parseInt("" + value) }
    });

const pointVar = (
  pointer_type: "Plant" | "GenericPointer" | "Weed",
  value: string | number,
) => ({ identifierLabel: label, allowedVariableNodes }: NewVarProps): VariableWithAValue =>
    createVariableNode(allowedVariableNodes)(label, {
      kind: "point",
      args: { pointer_type, pointer_id: parseInt("" + value) }
    });

const manualEntry = (value: string | number) =>
  ({ identifierLabel: label, allowedVariableNodes }: NewVarProps): VariableWithAValue =>
    createVariableNode(allowedVariableNodes)(label, {
      kind: "coordinate",
      args: value ? JSON.parse("" + value) : { x: 0, y: 0, z: 0 }
    });

/**
 * Create a parameter declaration or a parameter application containing an
 *    identifier.
 */
export const newParameter = (p: NewVarProps): VariableNode => {
  const { identifierLabel: label, newVarLabel, allowedVariableNodes } = p;
  if (allowedVariableNodes === AllowedVariableNodes.identifier && newVarLabel) {
    return createParameterApplication(label, {
      kind: "identifier",
      args: {
        label: newVarLabel
      }
    });
  } else {
    return {
      kind: "parameter_declaration",
      args: {
        label,
        default_value: NOTHING_SELECTED
      }
    };
  }
};

/** Create a variable based on the dropdown heading ID. */
const createNewVariable = (props: NewVarProps): VariableNode | undefined => {
  const ddi = props.dropdown;
  if (ddi.isNull) { return nothingVar(props); } // Empty form. Nothing selected yet.
  switch (ddi.headingId) {
    case "Plant":
    case "GenericPointer":
    case "Weed":
      return pointVar(ddi.headingId, ddi.value)(props);
    case "Tool": return toolVar(ddi.value)(props);
    case "parameter": return newParameter(props);
    case "Coordinate": return manualEntry(ddi.value)(props);
    case "PointGroup":
      const point_group_id = parseInt("" + ddi.value, 10);
      return {
        kind: "parameter_application",
        args: {
          label: props.identifierLabel,
          data_value: { kind: "point_group", args: { point_group_id } }
        }
      };
  }
  console.error("WARNING: Don't know how to handle " + (ddi.headingId || "NA"));
  return undefined;
};
/** Convert a drop down selection to a variable. */
export const convertDDItoVariable =
  (p: NewVarProps) => {
    if (p.dropdown.headingId === "parameter") {
      return createNewVariable({
        ...p,
        newVarLabel: "" + p.dropdown.value
      });
    } else {
      return createNewVariable({
        ...p,
        newVarLabel: undefined
      });
    }
  };

export const isScopeDeclarationBodyItem =
  (x: VariableNode): x is ScopeDeclarationBodyItem =>
    x.kind === "parameter_declaration" || x.kind === "variable_declaration";

/** Add a new variable or replace an existing one with the same label (regimens). */
export const addOrEditBodyVariables = (
  bodyVariables: VariableNode[],
  updatedItem: ScopeDeclarationBodyItem,
): ScopeDeclarationBodyItem[] => {
  const filteredVariables: ScopeDeclarationBodyItem[] =
    betterCompact(bodyVariables.map(v =>
      isScopeDeclarationBodyItem(v) ? v : undefined));
  const items = reduceScopeDeclaration(filteredVariables);
  items[updatedItem.args.label] = updatedItem;
  return Object.values(items);
};

/** Add a new declaration or replace an existing one with the same label.
 * (sequences) */
export const addOrEditDeclarationLocals = (
  declarations: ScopeDeclarationBodyItem[],
  updatedItem: ScopeDeclarationBodyItem,
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
