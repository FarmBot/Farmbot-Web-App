import { VariableNameSet, ResourceIndex, UUID } from "./interfaces";
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

export interface SequenceMeta {
  celeryNode: ScopeDeclarationBodyItem;
  dropdown: DropDownItem;
  vector: Vector3 | undefined;
}

/** Converts a "scope declaration body item" (AKA a CeleryScript variable) into
 * a 3 dimensional location vector. If unable a vector cannot be determined,
 * (0, 0, 0) is returned. Provide a UUID when calling from a sequence step to
 * make an attempt to show the resolved vector from the sequence scope. */
export const determineVector =
  (node: ScopeDeclarationBodyItem, resources: ResourceIndex, uuid?: UUID):
    Vector3 | undefined => {
    if (node.kind == "parameter_declaration") {
      // parameter_declaration coordinates can't be known until runtime
      return undefined;
    }

    const variableContents = node.args.data_value;
    switch (variableContents.kind) {
      case "coordinate": return variableContents.args;
      case "point":
        const { pointer_type, pointer_id } = variableContents.args;
        return findPointerByTypeAndId(resources, pointer_type, pointer_id).body;
      case "tool":
        const ts = findSlotByToolId(resources, variableContents.args.tool_id);
        return ts ? ts.body : undefined;
      case "identifier":
        if (uuid) {
          // Try to find a vector in scope declarations for the variable.
          const variable = findVariableByName(resources, uuid, node.args.label);
          return variable ? variable.vector : undefined;
        }
    }
    return undefined;
  };

/** Given a CeleryScript variable declaration and a resource index
 * Returns a DropDownItem representation of said variable. */
export const determineDropdown =
  (node: ScopeDeclarationBodyItem, resources: ResourceIndex): DropDownItem => {
    if (node.kind === "parameter_declaration") {
      return { label: capitalize(node.args.label), value: "?" };
    }

    const { data_value } = node.args;
    switch (data_value.kind) {
      case "coordinate":
        const { x, y, z } = data_value.args;
        return { label: `Coordinate (${x}, ${y}, ${z})`, value: "?" };
      case "identifier":
        return { label: capitalize(data_value.args.label), value: "?" };
      case "point":
        const { pointer_id, pointer_type } = data_value.args;
        const pointer =
          findPointerByTypeAndId(resources, pointer_type, pointer_id);
        return formatPoint(pointer);
      case "tool":
        const toolName = findToolById(resources, data_value.args.tool_id)
          .body.name || "Untitled tool";
        return { label: toolName, value: "X" };
    }
    throw new Error("WARNING: Unknown, possibly new data_value.kind?");
  };

/** Can this CeleryScript variable be edited? Should we gray out the form? */
export const determineEditable = (node: ScopeDeclarationBodyItem): boolean => {
  return node.kind == "variable_declaration" &&
    node.args.data_value.kind == "coordinate";
};

/** Creates the sequence meta data lookup table for an entire ResourceIndex.
 * Used to overwrite the entire index on any data change. */
export const createSequenceMeta =
  (resources: ResourceIndex, sequence: TaggedSequence): VariableNameSet => {
    const collection = sequence.body.args.locals.body || [];
    const reducer = (acc: VariableNameSet, celeryNode: ScopeDeclarationBodyItem):
      VariableNameSet => ({
        ...acc,
        [celeryNode.args.label]: {
          celeryNode,
          vector: determineVector(celeryNode, resources),
          dropdown: determineDropdown(celeryNode, resources),
        }
      });
    return collection.reduce(reducer, {});
  };

/** Search a sequence's scope declaration for a particular variable by name. */
export const findVariableByName =
  (i: ResourceIndex, uuid: string, label: string): SequenceMeta | undefined => {
    return (i.sequenceMetas[uuid] || {})[label];
  };
