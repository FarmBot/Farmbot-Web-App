import { VariableNameSet, ResourceIndex } from "./interfaces";
import {
  ScopeDeclarationBodyItem,
  TaggedSequence,
  Vector3,
} from "farmbot";
import { DropDownItem } from "../ui";
import { findPointerByTypeAndId } from "./selectors";
import { findSlotByToolId, findToolById } from "./selectors_by_id";
import { capitalize } from "lodash";
import {
  formatPoint
} from "../sequences/step_tiles/tile_move_absolute/generate_list";
import {
  LocationData
} from "../sequences/step_tiles/tile_move_absolute/interfaces";

export interface SequenceMeta {
  celeryNode: ScopeDeclarationBodyItem;
  dropdown: DropDownItem;
  location: Vector3;
  editable: boolean;
  variableValue: LocationData;
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

const determineDropdown =
  (n: ScopeDeclarationBodyItem, i: ResourceIndex): DropDownItem => {
    if (n.kind === "parameter_declaration") {
      return { label: capitalize(n.args.label), value: "?" };
    }

    const { data_value } = n.args;
    switch (data_value.kind) {
      case "coordinate":
        return { label: "TODO Fixme", value: "?" };
      case "identifier":
        return { label: capitalize(data_value.args.label), value: "?" };
      case "point":
        const { pointer_id, pointer_type } = data_value.args;
        const pointer =
          findPointerByTypeAndId(i, pointer_type, pointer_id);
        return formatPoint(pointer);
      case "tool":
        const toolName =
          findToolById(i, data_value.args.tool_id).body.name || "Untitled tool";
        return { label: toolName, value: "X" };
    }
    throw new Error("Is there a new data_value.kind?");
  };

const determineEditable = (_node: ScopeDeclarationBodyItem): boolean => {
  return _node.kind == "variable_declaration" &&
    _node.args.data_value.kind == "coordinate";
};

const determineVariableValue =
  (_node: ScopeDeclarationBodyItem): LocationData => {
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
        dropdown: determineDropdown(celeryNode, index),
        variableValue: determineVariableValue(celeryNode),
      }
    });
  };
  return collection.reduce(reducer, {});
};

export const extractParent =
  (i: ResourceIndex, uuid: string): SequenceMeta | undefined => {
    return findVariableByName(i, uuid, "parent");
  };

export const findVariableByName =
  (i: ResourceIndex, uuid: string, label: string): SequenceMeta | undefined => {
    return (i.sequenceMetas[uuid] || {})[label];
  };
