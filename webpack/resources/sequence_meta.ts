import { VariableNameSet, ResourceIndex } from "./interfaces";
import {
  ScopeDeclarationBodyItem,
  TaggedSequence,
  Vector3,
  TaggedPoint,
  TaggedTool,
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
import {
  EMPTY_COORD
} from "../sequences/step_tiles/tile_move_absolute/handle_select";
import { findByKindAndId } from "./selectors_by_kind";

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
const vec000: Vector3 = vec(0, 0, 0);

/** Converts a "scope declaration body item" (AKA a CeleryScript variable) into
 * a 3 dimensional location vector. If unable a vector cannot be determined,
 * (0, 0, 0) is returned. */
const determineLocation =
  (index: ResourceIndex, node: ScopeDeclarationBodyItem): Vector3 => {
    if (node.kind == "parameter_declaration") {
      // The location of parameter_declarations can't be known until runtime
      return vec000;
    }

    const variableContents = node.args.data_value;
    switch (variableContents.kind) {
      case "coordinate": return variableContents.args;
      case "point":
        const { pointer_type, pointer_id } = variableContents.args;
        return findPointerByTypeAndId(index, pointer_type, pointer_id).body;
      case "tool":
        const ts = findSlotByToolId(index, variableContents.args.tool_id);
        return ts ? ts.body : vec000;
    }
    return vec000;
  };

/** Given a CeleryScript variable declaration and a resource index
 * Returns a DropDownItem representation of said variable. */
const determineDropdown =
  (n: ScopeDeclarationBodyItem, i: ResourceIndex): DropDownItem => {
    if (n.kind === "parameter_declaration") {
      return { label: capitalize(n.args.label), value: "?" };
    }

    const { data_value } = n.args;
    switch (data_value.kind) {
      case "coordinate":
        const { x, y, z } = data_value.args;
        return { label: `Coordinate (${x}, ${y}, ${z})`, value: "?" };
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
    throw new Error("WARNING: Unknown, possibly new data_value.kind?");
  };

/** Can this CeleryScript variable be edited? Should we gray out the form? */
const determineEditable = (node: ScopeDeclarationBodyItem): boolean => {
  return node.kind == "variable_declaration" &&
    node.args.data_value.kind == "coordinate";
};

/** Resolve the value of a variable. If not possible, return empty coord. */
const determineVariableValue =
  (_node: ScopeDeclarationBodyItem, _i: ResourceIndex): LocationData => {
    return _node.kind === "parameter_declaration" ?
      { kind: "coordinate", args: vec000 } : _node.args.data_value;
  };

/** Creates the sequence meta data lookup table for an entire ResourceIndex.
 * Used to overwrite the entire index on any data change. */
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
        variableValue: determineVariableValue(celeryNode, index),
      }
    });
  };
  return collection.reduce(reducer, {});
};

/** Returns the `parent` variable (or nothing) for a particular UUID. */
export const extractParent =
  (i: ResourceIndex, uuid: string): SequenceMeta | undefined => {
    return findVariableByName(i, uuid, "parent");
  };

/** Search a sequence's scope declaration for a particular variable by name.
 * As of 2018, the UI only cares about "parent" though celeryscript itself has
 * no restriction on variable names / count. */
export const findVariableByName =
  (i: ResourceIndex, uuid: string, label: string): SequenceMeta | undefined => {
    return (i.sequenceMetas[uuid] || {})[label];
  };

// ==== SUPPORT INTERFACES
/** User selected a pre-existing variable. */
type BoundVariableResult = { kind: "BoundVariable", body: SequenceMeta };
/** User selected a variable that does not exist in current scope. */
type UnboundVariableResult = { kind: "UnboundVariable", body: { label: string } };
type EmptyResult = { kind: "None", body: undefined };
/** When you have a DDI that references a variable, there are several possible
 * outcomes when it is "decoded" back into its original value. This is a tagged
 * union representing all possible outcomes. */
export type MoveAbsDropDownContents =
  | BoundVariableResult /** The DDI references a real variable */
  | UnboundVariableResult /** The DDI references a nonexistent variable */
  | EmptyResult /** Something went wrong, probably. */
  | TaggedPoint /** The DDI refers to a point resource. */
  | TaggedTool; /** The DDI refers to a tool resource. */
/** A function that can determine the original value of a celeryscript variable
 *  DropDownItem */
type ConverterFn = (i: ResourceIndex,
  d: DropDownItem,
  sequenceUuid: string) => MoveAbsDropDownContents;
const NONE: EmptyResult = { kind: "None", body: undefined };
// ====

/** Convert specially formatted DropDownItem (CeleryScript variable) into the
 * object it represents (Tool, Point, Identifier, etc...). */
export const convertDdiToCelery: ConverterFn = (
  index,
  /** Dropdown item where headingId is a KnownGroupTag. d.value is a resource
   * ID or a celeryScript identifier `label`.*/
  dropDown,
  /**UUID of the current sequence (for finding `label` values) */
  currentUuid) => {
  const id = parseInt("" + dropDown.value, 10);

  switch (dropDown.headingId) {
    case "GenericPointer":
    case "ToolSlot":
    case "Plant":
      return findByKindAndId<TaggedPoint>(index, "Point", id);
    case "Tool": return findToolById(index, id);
    case "identifier":
      const label = "" + dropDown.value;
      const body = findVariableByName(index, currentUuid, label);
      return body ?
        { kind: "BoundVariable", body }
        : { kind: "UnboundVariable", body: { label } };
  }

  return NONE;
};

/** Helps decode DDIs that were created via generateList() */
export const convertDropdownToLocation =
  (input: MoveAbsDropDownContents): LocationData => {
    switch (input.kind) {
      case "Tool":
        return { kind: "tool", args: { tool_id: input.body.id || 0 } };
      case "Point":
        const args =
          ({ pointer_id: input.body.id || 0, pointer_type: input.kind });
        return { kind: "point", args };
      case "BoundVariable": return input.body.variableValue;
      default: return EMPTY_COORD;
    }
  };
