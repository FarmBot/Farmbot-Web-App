import { VariableNameSet, ResourceIndex } from "../../resources/interfaces";
import {
  ParameterApplication, Dictionary,
  VariableDeclaration, ParameterDeclaration,
} from "farmbot";
import { betterCompact } from "../../util";
import { isParameterDeclaration } from "./locals_list";
import { determineVector, determineDropdown } from "../../resources/sequence_meta";
import { VariableNode } from "./locals_list_support";

const createVariableDeclaration =
  (parameter: ParameterDeclaration): VariableDeclaration => ({
    kind: "variable_declaration",
    args: { label: parameter.args.label, data_value: parameter.args.default_value }
  });

const createParameterApplication =
  (parameter: ParameterDeclaration): ParameterApplication => ({
    kind: "parameter_application",
    args: { label: parameter.args.label, data_value: parameter.args.default_value }
  });

const onlyParameterDeclarations = (variableData: VariableNameSet | undefined) =>
  betterCompact(Object.values(variableData || {})
    .map(v => v && isParameterDeclaration(v.celeryNode) ? v.celeryNode : undefined));

/**
 * Create default parameter applications for unassigned variables.
 */
export const variableList = (variableData: VariableNameSet | undefined):
  ParameterApplication[] | undefined => {
  const body = onlyParameterDeclarations(variableData)
    .map(createParameterApplication);
  return body.length > 0 ? body : undefined;
};

export const varDeclarationList = (variableData: VariableNameSet | undefined):
  VariableDeclaration[] | undefined => {
  const body = onlyParameterDeclarations(variableData)
    .map(createVariableDeclaration);
  return body.length > 0 ? body : undefined;
};

/** Add a new var declaration or replace an existing one with the same label. */
export const addOrEditParamApps =
  (variables: ParameterApplication[],
    updatedItem: ParameterApplication): ParameterApplication[] => {
    const items = reduceVariables(variables);
    items[updatedItem.args.label] = updatedItem;
    return Object.values(items);
  };

/** Convert array to a dictionary. */
export const reduceVariables = <T extends VariableNode>(
  variables: T[]):
  Dictionary<T> => {
  const items: Dictionary<T> = {};
  variables.map(d => items[d.args.label] = d);
  return items;
};

/** Add new parameter applications if they don't already exist. */
export const mergeVariables = <T extends VariableNode>(
  varData: VariableNameSet | undefined,
  variables: T[],
  newVariableKind: "parameter_application" | "variable_declaration",
): T[] => {
  /** New variables required by the chosen sequence. */
  const newVars = newVariableKind === "variable_declaration"
    ? reduceVariables(varDeclarationList(varData) || [])
    : reduceVariables(variableList(varData) || []);
  const bodyVars = reduceVariables<T>(variables);
  Object.entries(newVars)
    /** Filter out variables already in the body. */
    .filter(([k, _]) => !Object.keys(bodyVars).includes(k))
    /** Add the remaining new variables to the Regimen body. */
    .map(([k, v]) => bodyVars[k] = v);
  return Object.values(bodyVars);
};

/** Add new parameter applications if they don't already exist. */
export const mergeParameterApplications = (
  varData: VariableNameSet | undefined,
  bodyVariables: ParameterApplication[],
): ParameterApplication[] => {
  return mergeVariables(varData, bodyVariables, "parameter_application");
};

/** Add new variables if they don't already exist. */
export const mergeDeclarations = (
  varData: VariableNameSet | undefined,
  bodyVariables: VariableNode[],
): VariableNode[] => {
  return mergeVariables(varData, bodyVariables, "variable_declaration");
};

/** Convert Regimen body variable data into a VariableNameSet. */
export const getRegimenVariableData = (
  bodyVariables: VariableNode[],
  resources: ResourceIndex,
): VariableNameSet => {
  const varData: VariableNameSet = {};
  bodyVariables.map(variable => {
    varData[variable.args.label] = {
      celeryNode: variable,
      vector: determineVector(variable, resources),
      dropdown: determineDropdown(variable, resources),
    };
  });
  return varData;
};
