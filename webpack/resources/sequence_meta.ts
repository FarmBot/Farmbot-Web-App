import { VariableNameSet, ResourceIndex } from "./interfaces";
import {
  ScopeDeclarationBodyItem,
  TaggedSequence,
  Vector3,
  Coordinate,
  Identifier,
  Point,
  Tool,
} from "farmbot";
import { DropDownItem } from "../ui";
import { findPointerByTypeAndId } from "./selectors";
import { findSlotByToolId } from "./selectors_by_id";
import { capitalize } from "lodash";

type ValueOfVariable = Coordinate | Identifier | Point | Tool;

export interface SequenceMeta {
  celeryNode: ScopeDeclarationBodyItem;
  dropdown: DropDownItem;
  location: Vector3;
  editable: boolean;
  variableValue: ValueOfVariable;
}

type R =
  (acc: VariableNameSet, item: ScopeDeclarationBodyItem) => VariableNameSet;
type VLT =
  (_ri: ResourceIndex, tr: TaggedSequence) => VariableNameSet;
const vec = (x: number, y: number, z: number): Vector3 => ({ x, y, z });
const vector000: Vector3 = vec(0, 0, 0);

const determineLocation =
  (index: ResourceIndex, node: ScopeDeclarationBodyItem): Vector3 => {
    if (node.kind == "parameter_declaration") {
      // The location of parameter_declarations can't be known until runtime
      return vector000;
    }

    const variableContents = node.args.data_value;
    switch (variableContents.kind) {
      case "coordinate": return variableContents.args;
      case "point":
        const p = findPointerByTypeAndId(index,
          variableContents.args.pointer_type,
          variableContents.args.pointer_id).body;
        return vec(p.x, p.y, p.z);
      case "tool":
        const ts = findSlotByToolId(index, variableContents.args.tool_id);
        return ts ? ts.body : vector000;
    }
    return vector000;
  };

const determineDropdown = (node: ScopeDeclarationBodyItem): DropDownItem => {
  const value = "?"; // TBD
  return { label: capitalize(node.args.label), value };
};

const determineEditable = (node: ScopeDeclarationBodyItem): boolean => {
  return node.kind === "variable_declaration";
};

const determineVariableValue =
  (_node: ScopeDeclarationBodyItem): ValueOfVariable => {
    return { kind: "coordinate", args: { x: 0, y: 0, z: 0 } };
  };

export const createSequenceMeta: VLT = (index, resource) => {
  const collection = resource.body.args.locals.body || [];
  const reducer: R = (acc, celeryNode) => {
    const location = determineLocation(index, celeryNode);
    return ({
      ...acc,
      [celeryNode.args.label]: {
        celeryNode, location,
        editable: determineEditable(celeryNode),
        dropdown: determineDropdown(celeryNode),
        variableValue: determineVariableValue(celeryNode),
      }
    });
  };
  return collection.reduce(reducer, {});
};
