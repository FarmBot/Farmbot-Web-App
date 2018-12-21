import { VariableNameSet } from "../../resources/interfaces";
import { VariableDeclaration, Dictionary } from "farmbot";
import { betterCompact } from "../../util";
import { isParameterDeclaration } from "./locals_list";
import { EMPTY_COORD } from "./handle_select";

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
export const addOrEditVarDeclaration = (declarations: VariableDeclaration[]) =>
  (updatedItem: VariableDeclaration): VariableDeclaration[] => {
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
