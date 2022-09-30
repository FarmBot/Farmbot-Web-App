import React from "react";
import { t } from "../../i18next_wrapper";
import { addOrEditDeclarationLocals } from "../locals_list/handle_select";
import { LocalsListProps, VariableNode } from "../locals_list/locals_list_support";
import { defensiveClone, betterCompact } from "../../util/util";
import {
  TaggedSequence,
  ParameterDeclaration,
  ScopeDeclarationBodyItem,
  ParameterApplication,
  TaggedRegimen,
  TaggedResource,
} from "farmbot";
import { overwrite } from "../../api/crud";
import { VariableForm } from "./variable_form";
import {
  SequenceMeta, determineDropdown, determineVector,
} from "../../resources/sequence_meta";
import { ResourceIndex, VariableNameSet } from "../../resources/interfaces";
import { error } from "../../toast/toast";
import { variableIsInUse } from "./sanitize_nodes";
import { sortVariables } from "./variable_form_list";
import { determineVariableType } from "./new_variable";

interface LocalListCbProps {
  dispatch: Function;
  sequence: TaggedSequence;
}

/** Overwrite sequence locals (scope declaration). */
export const localListCallback =
  ({ dispatch, sequence }: LocalListCbProps) =>
    (declarations: ScopeDeclarationBodyItem[]) =>
      (declaration: ScopeDeclarationBodyItem,
        variableKey: string,
      ) => {
        const clone = defensiveClone(sequence.body); // unfortunate
        clone.args.locals = addOrEditDeclarationLocals(
          declarations, declaration, variableKey);
        dispatch(overwrite(sequence, clone));
      };

const isInUse = (
  resource: TaggedResource | undefined,
  variableData: VariableNameSet | undefined,
  label: string,
) => {
  switch (resource?.kind) {
    case "Regimen":
      return Object.keys(variableData || {}).includes(label);
    case "Sequence":
      return variableIsInUse(resource.body, label);
  }
};

export interface RemoveVariableProps {
  dispatch: Function;
  resource: TaggedSequence | TaggedRegimen;
  variableData: VariableNameSet;
}

export const removeVariable =
  ({ dispatch, resource, variableData }: RemoveVariableProps) =>
    (label: string) => {
      if (isInUse(resource, variableData, label)) {
        error(t("This variable is currently being used and cannot be deleted."));
      } else {
        const updated = defensiveClone(resource);
        if (updated.kind == "Regimen") {
          updated.body.body =
            updated.body.body.filter(item => item.args.label != label);
        } else {
          updated.body.args.locals.body = updated.body.args
            .locals.body?.filter(item => item.args.label != label);
        }
        dispatch(overwrite(resource, updated.body));
      }
    };

export const isParameterDeclaration =
  (x: VariableNode): x is ParameterDeclaration =>
    x.kind === "parameter_declaration";

/**
 * List of local variables for a sequence.
 * If none are found, shows nothing.
 */
export const LocalsList = (props: LocalsListProps) => {
  const variableData = Object.values(props.variableData || {});
  const { bodyVariables } = props;
  return <div className="locals-list">
    {sortVariables(variableData
      // Show variables if in Sequence header or not already defined
      .filter(v => v && (!bodyVariables || isParameterDeclaration(v.celeryNode)))
      // Show default values for parameters as a fallback if not in Sequence header
      .map(v => v && bodyVariables && isParameterDeclaration(v.celeryNode)
        ? convertFormVariable(v.celeryNode, props.resources)
        : v))
      .map(variable => <VariableForm
        key={variable.celeryNode.args.label}
        locationDropdownKey={props.locationDropdownKey}
        bodyVariables={bodyVariables}
        variable={variable}
        inUse={isInUse(props.resources.references[props.sequenceUuid],
          props.variableData, variable.celeryNode.args.label)}
        sequenceUuid={props.sequenceUuid}
        resources={props.resources}
        allowedVariableNodes={props.allowedVariableNodes}
        removeVariable={props.removeVariable}
        onChange={props.onChange}
        labelOnly={props.labelOnly}
        variableType={determineVariableType(variable.celeryNode)}
        hideGroups={props.hideGroups} />)}
  </div>;
};

export const generateNewVariableLabel = (
  variableData: (VariableNode | undefined)[],
  newLabel: (n: number) => string,
) => {
  const existingLabels = betterCompact(variableData)
    .map(variable => variable.args.label);
  let i = 1;
  while (existingLabels.includes(newLabel(i))) { i++; }
  return newLabel(i);
};

/** Show a parameter_declaration as its default value in the variable form. */
export const convertFormVariable =
  (variable: ParameterDeclaration, resources: ResourceIndex):
    SequenceMeta => {
    const converted: ParameterApplication = {
      kind: "parameter_application", args: {
        label: variable.args.label,
        data_value: variable.args.default_value
      }
    };
    return {
      celeryNode: converted,
      dropdown: determineDropdown(converted, resources),
      vector: determineVector(converted, resources),
      isDefault: true,
    };
  };
