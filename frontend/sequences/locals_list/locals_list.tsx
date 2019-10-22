import * as React from "react";
import { addOrEditDeclarationLocals } from "../locals_list/handle_select";
import { LocalsListProps, VariableNode } from "../locals_list/locals_list_support";
import { defensiveClone, betterCompact } from "../../util/util";
import {
  TaggedSequence,
  ParameterDeclaration,
  ScopeDeclarationBodyItem,
  ParameterApplication,
} from "farmbot";
import { overwrite } from "../../api/crud";
import { LocationForm } from "./location_form";
import {
  SequenceMeta, determineDropdown, determineVector
} from "../../resources/sequence_meta";
import { ResourceIndex } from "../../resources/interfaces";

interface LocalListCbProps {
  dispatch: Function;
  sequence: TaggedSequence;
}

/** Overwrite sequence locals (scope declaration). */
export const localListCallback =
  ({ dispatch, sequence }: LocalListCbProps) =>
    (declarations: ScopeDeclarationBodyItem[]) =>
      (declaration: ScopeDeclarationBodyItem) => {
        const clone = defensiveClone(sequence.body); // unfortunate
        clone.args.locals = addOrEditDeclarationLocals(declarations, declaration);
        dispatch(overwrite(sequence, clone));
      };

export const isParameterDeclaration =
  (x: VariableNode): x is ParameterDeclaration =>
    x.kind === "parameter_declaration";

/**
 * List of local variables for a sequence.
 * If none are found, shows nothing.
 */
export const LocalsList = (props: LocalsListProps) => {
  return <div className="locals-list">
    {betterCompact(Object.values(props.variableData || {})
      // Show variables if in Sequence header or not already defined
      .filter(v => v && (!props.bodyVariables || isParameterDeclaration(v.celeryNode)))
      // Show default values for parameters as a fallback if not in Sequence header
      .map(v => v && props.bodyVariables && isParameterDeclaration(v.celeryNode)
        ? convertFormVariable(v, props.resources) : v))
      .map(variable => <LocationForm
        key={variable.celeryNode.args.label}
        locationDropdownKey={props.locationDropdownKey}
        bodyVariables={props.bodyVariables}
        variable={variable}
        sequenceUuid={props.sequenceUuid}
        resources={props.resources}
        shouldDisplay={props.shouldDisplay}
        hideVariableLabel={Object.values(props.variableData || {}).length < 2}
        allowedVariableNodes={props.allowedVariableNodes}
        collapsible={props.collapsible}
        collapsed={props.collapsed}
        toggleVarShow={props.toggleVarShow}
        onChange={props.onChange}
        hideGroups={props.hideGroups}
        customFilterRule={props.customFilterRule} />)}
  </div>;
};

/** Show a parameter_declaration as its default value in the location form. */
const convertFormVariable = (variable: SequenceMeta, resources: ResourceIndex):
  SequenceMeta | undefined => {
  if (variable.celeryNode.kind === "parameter_declaration") {
    const converted: ParameterApplication = {
      kind: "parameter_application", args: {
        label: variable.celeryNode.args.label,
        data_value: variable.celeryNode.args.default_value
      }
    };
    return {
      celeryNode: converted,
      dropdown: determineDropdown(converted, resources),
      vector: determineVector(converted, resources),
      default: true,
    };
  }
};
