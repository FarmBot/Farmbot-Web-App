/** Given a drop down item and a ResourceIndex,
 * figures out the corresponding Tool | Coordinate | Point */
import { DropDownItem } from "../../ui";
import {
  ScopeDeclaration,
  ParameterApplication,
  Dictionary,
  ScopeDeclarationBodyItem,
  VariableDeclaration,
  resource_type,
} from "farmbot";
import {
  VariableNode, AllowedVariableNodes, VariableType,
} from "./locals_list_support";
import { betterCompact } from "../../util";
import { newVariableDataValue } from "./new_variable";

/**
 * Empty `data_value` for location form initial state.
 * This is specifically an invalid parameter application data value to force the
 * user to make a valid selection to successfully save the parameter application.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const NOTHING: any = { kind: "nothing", args: {} };

type DataValue = VariableDeclaration["args"]["data_value"];

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
  (label: string, data_value: DataValue): ParameterApplication => ({
    kind: "parameter_application",
    args: { label, data_value }
  });

const createVariableDeclaration =
  (label: string, data_value: DataValue): VariableDeclaration => ({
    kind: "variable_declaration",
    args: { label, data_value }
  });

interface NewVarProps {
  identifierLabel: string;
  allowedVariableNodes: AllowedVariableNodes;
  dropdown: DropDownItem;
  newVarLabel?: string;
  variableType?: VariableType;
}

const locationPlaceholderVar = ({
  identifierLabel: label, allowedVariableNodes
}: NewVarProps): VariableWithAValue =>
  createVariableNode(allowedVariableNodes)(label,
    { kind: "location_placeholder", args: {} });

const nothingVar = ({
  identifierLabel: label, allowedVariableNodes
}: NewVarProps): VariableWithAValue =>
  createVariableNode(allowedVariableNodes)(label, NOTHING as DataValue);

const toolVar = (value: string | number) => ({
  identifierLabel: label, allowedVariableNodes
}: NewVarProps): VariableWithAValue =>
  createVariableNode(allowedVariableNodes)(label, {
    kind: "tool",
    args: { tool_id: parseInt("" + value) }
  });

const pointVar = (
  pointer_type: "Plant" | "GenericPointer" | "Weed",
  value: string | number,
) =>
  ({ identifierLabel: label, allowedVariableNodes }: NewVarProps):
    VariableWithAValue =>
    createVariableNode(allowedVariableNodes)(label, {
      kind: "point",
      args: { pointer_type, pointer_id: parseInt("" + value) }
    });

const groupVar = (value: string | number) => ({
  identifierLabel: label
}: NewVarProps): VariableWithAValue =>
  createParameterApplication(label, {
    kind: "point_group",
    args: { point_group_id: parseInt("" + value) }
  });

const numberVar = (value: string | number) => ({
  identifierLabel: label, allowedVariableNodes
}: NewVarProps): VariableWithAValue =>
  createVariableNode(allowedVariableNodes)(label, {
    kind: "numeric",
    args: { number: parseFloat("" + value) }
  });

const stringVar = (value: string | number) => ({
  identifierLabel: label, allowedVariableNodes
}: NewVarProps): VariableWithAValue =>
  createVariableNode(allowedVariableNodes)(label, {
    kind: "text",
    args: { string: "" + value }
  });

const resourceVar = (value: string | number) => ({
  identifierLabel: label, allowedVariableNodes,
}: NewVarProps): VariableWithAValue =>
  createVariableNode(allowedVariableNodes)(label, {
    kind: "resource_placeholder",
    args: { resource_type: ("" + value) as resource_type }
  });

const specificResourceVar = (resourceType: resource_type) =>
  (value: string | number) => ({
    identifierLabel: label, allowedVariableNodes,
  }: NewVarProps): VariableWithAValue =>
    createVariableNode(allowedVariableNodes)(label, {
      kind: "resource",
      args: {
        resource_id: parseInt("" + value),
        resource_type: resourceType,
      }
    });

const manualEntry = (value: string | number) => ({
  identifierLabel: label, allowedVariableNodes
}: NewVarProps): VariableWithAValue =>
  createVariableNode(allowedVariableNodes)(label, {
    kind: "coordinate",
    args: value ? JSON.parse("" + value) : { x: 0, y: 0, z: 0 }
  });

/**
 * Create a parameter declaration or a parameter application containing an
 *    identifier.
 */
const newParameter = (p: NewVarProps): VariableNode => {
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
        default_value: newVariableDataValue(p.variableType)
      }
    };
  }
};

/** Create a variable based on the dropdown heading ID. */
// eslint-disable-next-line complexity
const createNewVariable = (props: NewVarProps): VariableNode | undefined => {
  const ddi = props.dropdown;
  if (ddi.isNull) { return nothingVar(props); } // Empty form. Nothing selected yet.
  switch (ddi.headingId) {
    case "Plant":
    case "GenericPointer":
    case "Weed":
      return pointVar(ddi.headingId, ddi.value)(props);
    case "Tool": return toolVar(ddi.value)(props);
    case "Variable": return newParameter(props);
    case "Coordinate": return manualEntry(ddi.value)(props);
    case "Location": return locationPlaceholderVar(props);
    case "PointGroup": return groupVar(ddi.value)(props);
    case "Numeric": return numberVar(ddi.value)(props);
    case "Text": return stringVar(ddi.value)(props);
    case "Resource": return resourceVar(ddi.value)(props);
    case "Sequence": return specificResourceVar("Sequence")(ddi.value)(props);
    case "Peripheral": return specificResourceVar("Peripheral")(ddi.value)(props);
    case "Sensor": return specificResourceVar("Sensor")(ddi.value)(props);
  }
  console.error(`WARNING: Don't know how to handle ${ddi.headingId}`);
  return undefined;
};
/** Convert a drop down selection to a variable. */
export const convertDDItoVariable =
  (p: NewVarProps) => {
    if (p.dropdown.headingId === "Variable") {
      return createNewVariable({
        ...p,
        newVarLabel: "" + p.dropdown.value,
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
  variableKey: string,
): ScopeDeclarationBodyItem[] => {
  const filteredVariables: ScopeDeclarationBodyItem[] =
    betterCompact(bodyVariables.map(v =>
      isScopeDeclarationBodyItem(v) ? v : undefined));
  const items = reduceScopeDeclaration(filteredVariables);
  items[variableKey] = updatedItem;
  return Object.values(items);
};

/** Add a new declaration or replace an existing one with the same label.
 * (sequences) */
export const addOrEditDeclarationLocals = (
  declarations: ScopeDeclarationBodyItem[],
  updatedItem: ScopeDeclarationBodyItem,
  variableKey: string,
): ScopeDeclaration => {
  const updatedDeclarations = addOrEditBodyVariables(declarations,
    updatedItem, variableKey);
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
