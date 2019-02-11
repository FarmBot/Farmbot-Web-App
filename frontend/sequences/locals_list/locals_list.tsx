import * as React from "react";
import { addOrEditDeclaration } from "../locals_list/handle_select";
import {
  LocalsListProps, AllowedDeclaration
} from "../locals_list/locals_list_support";
import { defensiveClone, betterCompact } from "../../util/util";
import {
  TaggedSequence,
  ScopeDeclarationBodyItem,
  ParameterDeclaration,
} from "farmbot";
import { overwrite } from "../../api/crud";
import { LocationForm } from "./location_form";

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
        clone.args.locals = addOrEditDeclaration(declarations)(declaration);
        dispatch(overwrite(sequence, clone));
      };

export const isParameterDeclaration =
  (x: ScopeDeclarationBodyItem): x is ParameterDeclaration =>
    x.kind === "parameter_declaration";

/**
 * List of local variable/parameter declarations for a sequence.
 * If none are found, shows nothing.
 */
export const LocalsList = (props: LocalsListProps) => {
  return <div className="locals-list">
    {betterCompact(Object.values(props.variableData || {}))
      .filter(v => props.allowedDeclarations !== AllowedDeclaration.parameter
        ? isParameterDeclaration(v.celeryNode) : v)
      .map(variable =>
        <LocationForm
          key={variable.celeryNode.args.label}
          locationDropdownKey={props.locationDropdownKey}
          declarations={props.declarations}
          variable={variable}
          sequenceUuid={props.sequenceUuid}
          resources={props.resources}
          shouldDisplay={props.shouldDisplay}
          hideVariableLabel={Object.values(props.variableData || {}).length < 2}
          allowedDeclarations={props.allowedDeclarations}
          onChange={props.onChange} />)}
  </div>;
};
