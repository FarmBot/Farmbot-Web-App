import { VariableNameSet, ResourceIndex } from "../../resources/interfaces";
import { VariableDeclaration, Dictionary, ScopeDeclarationBodyItem } from "farmbot";
import { betterCompact } from "../../util";
import { isParameterDeclaration } from "./locals_list";
import { EMPTY_COORD } from "./handle_select";
import { determineVector, determineDropdown } from "../../resources/sequence_meta";

/**
 * Create default variable declarations in (execute step, farm event) body
 * for unassigned variables.
 */
export const declarationList = (variableData: VariableNameSet | undefined):
  VariableDeclaration[] | undefined => {
  const body = betterCompact(Object.values(variableData || {})
    .map(m =>
      m && isParameterDeclaration(m.celeryNode) ? m.celeryNode : undefined))
    .map(v => {
      const declaration: VariableDeclaration = {
        kind: "variable_declaration", args: {
          label: v.args.label, data_value: EMPTY_COORD
        }
      };
      return declaration;
    });
  return body.length > 0 ? body : undefined;
};

/** Add a new var declaration or replace an existing one with the same label. */
export const addOrEditVarDeclaration =
  (declarations: VariableDeclaration[],
    updatedItem: VariableDeclaration): VariableDeclaration[] => {
    const items = reduceVarDeclarations(declarations);
    items[updatedItem.args.label] = updatedItem;
    return Object.values(items);
  };

/** Convert array to a dictionary. */
const reduceVarDeclarations = (declarations: VariableDeclaration[]):
  Dictionary<VariableDeclaration> => {
  const items: Dictionary<VariableDeclaration> = {};
  declarations.map(d => items[d.args.label] = d);
  return items;
};

/** Add new variable declarations if they don't already exist. */
export const mergeVariableDeclarations = (
  varData: VariableNameSet | undefined,
  declarations: VariableDeclaration[]
): VariableDeclaration[] => {
  /** New variables required by the chosen sequence. */
  const newVars = reduceVarDeclarations(declarationList(varData) || []);
  const regimenVars = reduceVarDeclarations(declarations);
  Object.entries(newVars)
    /** Filter out variables already in the Regimen. */
    .filter(([k, _]) => !Object.keys(regimenVars).includes(k))
    /** Add the remaining new variables to the Regimen body. */
    .map(([k, v]) => regimenVars[k] = v);
  return Object.values(regimenVars);
};

export const getRegimenVariableData = (
  declarations: ScopeDeclarationBodyItem[],
  resources: ResourceIndex
): VariableNameSet => {
  const varData: VariableNameSet = {};
  declarations.map(declaration => {
    varData[declaration.args.label] = {
      celeryNode: declaration,
      vector: determineVector(declaration, resources),
      dropdown: determineDropdown(declaration, resources),
    };
  });
  return varData;
};
