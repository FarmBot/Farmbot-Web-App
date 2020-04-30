import { VariableNameSet, ResourceIndex, UUID } from "./interfaces";
import {
  TaggedSequence,
  Vector3,
  ScopeDeclarationBodyItem,
} from "farmbot";
import { DropDownItem } from "../ui";
import { findPointerByTypeAndId, findPointGroup } from "./selectors";
import {
  findSlotByToolId,
  findToolById,
  findResourceById,
} from "./selectors_by_id";
import {
  formatPoint,
  NO_VALUE_SELECTED_DDI,
  formatTool,
  COORDINATE_DDI,
} from "../sequences/locals_list/location_form_list";
import { VariableNode } from "../sequences/locals_list/locals_list_support";
import { t } from "../i18next_wrapper";

export interface Vector3Plus extends Vector3 {
  gantry_mounted: boolean;
}

export interface SequenceMeta {
  celeryNode: VariableNode;
  dropdown: DropDownItem;
  vector: Vector3 | Vector3Plus | undefined;
  default?: boolean;
}

/** Converts a "scope declaration body item" (AKA a CeleryScript variable) into
 * a 3 dimensional location vector. If unable a vector cannot be determined,
 * `undefined` is returned. Provide a UUID when calling from a sequence step to
 * make an attempt to show the resolved vector from the sequence scope. */
export const determineVector =
  (node: VariableNode, resources: ResourceIndex, uuid?: UUID):
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
        const variable = maybeFindVariable(node.args.label, resources, uuid);
        return variable?.vector;
    }
    return undefined;
  };

/** Try to find a vector in scope declarations for the variable. */
export const maybeFindVariable = (
  label: string, resources: ResourceIndex, uuid?: UUID,
): SequenceMeta | undefined =>
  uuid ? findVariableByName(resources, uuid, label) : undefined;

/** Add "Location Variable - " prefix to string. */
export const withPrefix = (label: string) =>
  `${t("Location Variable")} - ${label}`;

interface DetermineVarDDILabelProps {
  label: string;
  resources: ResourceIndex;
  uuid?: UUID;
  forceExternal?: boolean;
}

export const determineVarDDILabel =
  ({ label, resources, uuid, forceExternal }: DetermineVarDDILabelProps):
    string => {
    if (forceExternal) { return t("Externally defined"); }
    const variable = maybeFindVariable(label, resources, uuid);
    if (variable) {
      if (variable.celeryNode.kind === "parameter_declaration") {
        return withPrefix(t("Externally defined"));
      }
      if (variable.celeryNode.kind !== "variable_declaration") {
        return withPrefix(t("Select a location"));
      }
      return withPrefix(variable.dropdown.label);
    }
    return withPrefix(t("Add new"));
  };

/** Given a CeleryScript parameter application and a resource index
 * Returns a DropDownItem representation of said variable. */
export const determineDropdown =
  (node: VariableNode, resources: ResourceIndex, uuid?: UUID): DropDownItem => {
    if (node.kind === "parameter_declaration") {
      return {
        label: t("Externally defined"),
        value: "?"
      };
    }

    const { data_value } = node.args;
    switch (data_value.kind) {
      case "coordinate":
        return COORDINATE_DDI(data_value.args);
      case "identifier":
        const { label } = data_value.args;
        const varName = determineVarDDILabel({ label, resources, uuid });
        return { label: varName, value: "?" };
      case "point":
        const { pointer_id, pointer_type } = data_value.args;
        const pointer =
          findPointerByTypeAndId(resources, pointer_type, pointer_id);
        return formatPoint(pointer);
      case "tool":
        const { tool_id } = data_value.args;
        const toolSlot = findSlotByToolId(resources, tool_id);
        return formatTool(findToolById(resources, tool_id), toolSlot);
      case "point_group":
        const value = data_value.args.point_group_id;
        const uuid2 = findResourceById(resources, "PointGroup", value);
        const group = findPointGroup(resources, uuid2);
        return {
          label: group.body.name,
          value
        };
      case "nothing" as unknown:
        return NO_VALUE_SELECTED_DDI();
    }
    throw new Error("WARNING: Unknown, possibly new data_value.kind?");
  };

/** Can this CeleryScript variable be edited? Should we gray out the form? */
export const determineEditable = (node: VariableNode): boolean => {
  return node.kind !== "parameter_declaration" &&
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
          vector: determineVector(celeryNode, resources, sequence.uuid),
          dropdown: determineDropdown(celeryNode, resources, sequence.uuid),
        }
      });
    return collection.reduce(reducer, {});
  };

/** Search a sequence's scope declaration for a particular variable by name. */
export const findVariableByName =
  (i: ResourceIndex, uuid: string, label: string): SequenceMeta | undefined => {
    return (i.sequenceMetas[uuid] || {})[label];
  };
