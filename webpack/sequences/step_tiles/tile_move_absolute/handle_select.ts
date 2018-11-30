/** Given a drop down item and a ResourceIndex,
 * figures out the corresponding Tool | Coordinate | Point */
import { DropDownItem } from "../../../ui/index";
import { ResourceIndex } from "../../../resources/interfaces";
import { LocationData } from "./interfaces";
import {
  ParameterDeclaration,
  Coordinate,
  ScopeDeclaration,
  ScopeDeclarationBodyItem,
  VariableDeclaration
} from "farmbot";

export type CeleryVariable = LocationData | ParameterDeclaration;
export const EMPTY_COORD: Coordinate =
  ({ kind: "coordinate", args: { x: 0, y: 0, z: 0 } });

const toolVar = (value: string | number): VariableDeclaration => ({
  kind: "variable_declaration",
  args: {
    label: "parent",
    data_value: {
      kind: "tool",
      args: {
        tool_id: parseInt("" + value)
      }
    }
  }
});

const pointVar =
  (pointer_type: "Plant" | "GenericPointer", value: string | number): VariableDeclaration => ({
    kind: "variable_declaration",
    args: {
      label: "parent",
      data_value: {
        kind: "point",
        args: { pointer_type, pointer_id: parseInt("" + value) }
      }
    }
  });

const manualEntry: VariableDeclaration = {
  kind: "variable_declaration",
  args: {
    label: "parent",
    data_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }
  }
};

const parentParameter: ParameterDeclaration = {
  kind: "parameter_declaration",
  args: { label: "parent", data_type: "point" }
};
const createNewParent =
  (_index: ResourceIndex, input: DropDownItem): ScopeDeclarationBodyItem | undefined => {
    switch (input.headingId) {
      case "Plant":
      case "GenericPointer": return pointVar(input.headingId, input.value);
      case "Tool": return toolVar(input.value);
      case "parameter": return parentParameter; // Caller decides X/Y/Z
      case "Other": return manualEntry;
    }
    return undefined;
  };

export let convertDDItoScopeDeclr =
  (index: ResourceIndex, input: DropDownItem): ScopeDeclaration => {
    const sd: ScopeDeclaration =
      ({ kind: "scope_declaration", args: {}, body: [] });
    const parent = createNewParent(index, input);
    parent && sd.body /** lol */ && sd.body.push(parent);
    return sd;
  };
