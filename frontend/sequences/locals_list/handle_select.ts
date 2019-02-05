/** Given a drop down item and a ResourceIndex,
 * figures out the corresponding Tool | Coordinate | Point */
import { DropDownItem } from "../../ui";
import {
  Coordinate,
  ScopeDeclaration,
  ScopeDeclarationBodyItem,
  VariableDeclaration,
  Dictionary,
  Identifier,
  Point,
  Tool,
  EveryPoint,
} from "farmbot";

/**
 * Empty `data_value` for location form initial state.
 * This is specifically an invalid variable declaration data value to force the
 * user to make a valid selection to successfully save the variable declaration.
 */
// tslint:disable-next-line:no-any
export const NOTHING_SELECTED: any = { kind: "nothing", args: {} };

type DataValue = Coordinate | Identifier | Point | Tool | EveryPoint;
const createVariableDeclaration =
  (label: string, data_value: DataValue): VariableDeclaration =>
    ({
      kind: "variable_declaration",
      args: { label, data_value }
    });

interface NewVarProps {
  label: string;
}

const nothingVar = ({ label }: NewVarProps): VariableDeclaration =>
  createVariableDeclaration(label, NOTHING_SELECTED);

const toolVar = (value: string | number) =>
  ({ label }: NewVarProps): VariableDeclaration =>
    createVariableDeclaration(label, {
      kind: "tool",
      args: { tool_id: parseInt("" + value) }
    });

const pointVar = (
  pointer_type: "Plant" | "GenericPointer",
  value: string | number
) => ({ label }: NewVarProps): VariableDeclaration =>
    createVariableDeclaration(label, {
      kind: "point",
      args: { pointer_type, pointer_id: parseInt("" + value) }
    });

const everyPointVar = (value: string | number) =>
  ({ label }: NewVarProps): VariableDeclaration =>
    createVariableDeclaration(label, {
      kind: "every_point",
      args: { every_point_type: "" + value }
    });

const manualEntry = ({ label }: NewVarProps): VariableDeclaration =>
  createVariableDeclaration(label, {
    kind: "coordinate", args: { x: 0, y: 0, z: 0 }
  });

interface NewDeclarationProps extends NewVarProps {
  newVarLabel?: string;
  useIdentifier?: boolean;
}

/**
 * Create a parameter declaration or a variable declaration containing an
 *    identifier.
 * `data_type` type will need to be updated to support types other than "point"
 */
export const newParameter =
  ({ label, newVarLabel, useIdentifier }: NewDeclarationProps):
    ScopeDeclarationBodyItem =>
    (useIdentifier && newVarLabel)
      // Create a new variable (reassignment)
      ? createVariableDeclaration(label,
        { kind: "identifier", args: { label: newVarLabel } })
      : { // Unassign variable (will not create a new variable name)
        kind: "parameter_declaration",
        args: { label, data_type: "point" }
      };

const newDeclarationCreator = (ddi: DropDownItem):
  (props: NewDeclarationProps) => ScopeDeclarationBodyItem | undefined => {
  if (ddi.isNull) { return nothingVar; } // Empty form. Nothing selected yet.
  switch (ddi.headingId) {
    case "Plant":
    case "GenericPointer": return pointVar(ddi.headingId, ddi.value);
    case "Tool": return toolVar(ddi.value);
    case "parameter": return newParameter; // Caller decides X/Y/Z
    case "every_point": return everyPointVar(ddi.value);
    case "Coordinate": return manualEntry;
  }
  return () => undefined;
};

interface ConvertDDIToDeclProps extends NewVarProps {
  useIdentifier?: boolean;
}

/** Convert a drop down selection to a declaration. */
export const convertDDItoDeclaration =
  ({ label, useIdentifier }: ConvertDDIToDeclProps) =>
    (ddi: DropDownItem): ScopeDeclarationBodyItem | undefined => {
      const newVarLabel =
        ddi.headingId === "parameter" ? "" + ddi.value : undefined;
      return newDeclarationCreator(ddi)({ label, newVarLabel, useIdentifier });
    };

/** Add a new declaration or replace an existing one with the same label. */
export const addOrEditDeclaration = (declarations: ScopeDeclarationBodyItem[]) =>
  (updatedItem: ScopeDeclarationBodyItem): ScopeDeclaration => {
    const items = reduceScopeDeclaration(declarations);
    items[updatedItem.args.label] = updatedItem;
    const newLocals: ScopeDeclaration = {
      kind: "scope_declaration",
      args: {},
      body: Object.values(items)
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
