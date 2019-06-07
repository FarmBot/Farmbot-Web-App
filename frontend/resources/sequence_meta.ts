import { VariableNameSet, ResourceIndex, UUID } from "./interfaces";
import {
  TaggedSequence,
  Vector3,
  ScopeDeclarationBodyItem,
} from "farmbot";
import { DropDownItem } from "../ui";
import { findPointerByTypeAndId } from "./selectors";
import { findSlotByToolId, findToolById } from "./selectors_by_id";
import {
  formatPoint, safeEveryPointType, everyPointDDI, NO_VALUE_SELECTED_DDI,
  formatTool
} from "../sequences/locals_list/location_form_list";
import { VariableNode } from "../sequences/locals_list/locals_list_support";
import { EveryPointShape } from "../sequences/locals_list/handle_select";
import { t } from "../i18next_wrapper";

export interface SequenceMeta {
  celeryNode: VariableNode;
  dropdown: DropDownItem;
  vector: Vector3 | undefined;
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
        return variable && variable.vector;
    }
    return undefined;
  };

/** Try to find a vector in scope declarations for the variable. */
const maybeFindVariable = (
  label: string, resources: ResourceIndex, uuid?: UUID
): SequenceMeta | undefined =>
  uuid ? findVariableByName(resources, uuid, label) : undefined;

const withPrefix = (label: string) => `${t("Location Variable")} - ${label}`;

export const determineVarDDILabel =
  (label: string, resources: ResourceIndex, uuid?: UUID): string => {
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
        label: t("Defined outside of sequence"),
        value: "parameter_declaration"
      };
    }

    const { data_value } = node.args;
    switch (data_value.kind) {
      case "coordinate":
        const { x, y, z } = data_value.args;
        return { label: `Coordinate (${x}, ${y}, ${z})`, value: "?" };
      case "identifier":
        const { label } = data_value.args;
        const varName = determineVarDDILabel(label, resources, uuid);
        return { label: varName, value: "?" };
      // tslint:disable-next-line:no-any
      case "every_point" as any:
        const { every_point_type } = (data_value as unknown as EveryPointShape).args;
        return everyPointDDI(safeEveryPointType(every_point_type));
      case "point":
        const { pointer_id, pointer_type } = data_value.args;
        const pointer =
          findPointerByTypeAndId(resources, pointer_type, pointer_id);
        return formatPoint(pointer);
      case "tool":
        const { tool_id } = data_value.args;
        const toolSlot = findSlotByToolId(resources, tool_id);
        return formatTool(findToolById(resources, tool_id), toolSlot);
      // tslint:disable-next-line:no-any // Empty, user must make a selection.
      case "nothing" as any:
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
