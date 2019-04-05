import React from "react";
import { VariableNode, AllowedVariableNodes } from "./locals_list_support";
import { ResourceIndex } from "../../resources/interfaces";
import { ParameterDeclaration, ParameterApplication } from "farmbot";
import { LocationForm } from "./location_form";
import {
  SequenceMeta, determineVector, determineDropdown
} from "../../resources/sequence_meta";

export interface DefaultValueFormProps {
  variableNode: VariableNode;
  resources: ResourceIndex;
  onChange: (v: ParameterDeclaration) => void;
}

export const DefaultValueForm = (props: DefaultValueFormProps) =>
  props.variableNode.kind === "parameter_declaration"
    ? <LocationForm
      key={props.variableNode.args.label + "default_value"}
      locationDropdownKey={JSON.stringify(props.variableNode) + "default_value"}
      variable={defaultValueVariableData(props.resources, props.variableNode)}
      sequenceUuid={""}
      resources={props.resources}
      shouldDisplay={() => true}
      allowedVariableNodes={AllowedVariableNodes.variable}
      hideTypeLabel={true}
      onChange={change(props.onChange, props.variableNode)} />
    : <div />;

const change =
  (onChange: (v: ParameterDeclaration) => void, variable: VariableNode) =>
    (formResponse: ParameterApplication) =>
      onChange({
        kind: "parameter_declaration",
        args: {
          label: variable.args.label,
          default_value: formResponse.args.data_value
        }
      });

const defaultValueVariableData = (
  resources: ResourceIndex,
  node: ParameterDeclaration
): SequenceMeta => {
  const celeryNode: ParameterApplication = {
    kind: "parameter_application",
    args: { label: "Default Value", data_value: node.args.default_value }
  };
  return {
    celeryNode,
    vector: determineVector(celeryNode, resources),
    dropdown: determineDropdown(celeryNode, resources),
  };
};
