import React from "react";
import {
  VariableNode, AllowedVariableNodes, OnChange,
} from "./locals_list_support";
import { ResourceIndex } from "../../resources/interfaces";
import { ParameterDeclaration, ParameterApplication } from "farmbot";
import { VariableForm } from "./variable_form";
import {
  SequenceMeta, determineVector, determineDropdown,
} from "../../resources/sequence_meta";
import { t } from "../../i18next_wrapper";
import { determineVariableType } from "./new_variable";

export interface DefaultValueFormProps {
  variableNode: VariableNode;
  resources: ResourceIndex;
  onChange: OnChange;
  removeVariable?(label: string): void;
}

export const DefaultValueForm = (props: DefaultValueFormProps) => {
  if (props.variableNode.kind === "parameter_declaration") {
    return <div className="default-value-form">
      <VariableForm
        key={props.variableNode.args.label + "default_value"}
        locationDropdownKey={JSON.stringify(props.variableNode) + "default_value"}
        variable={defaultValueVariableData(props.resources, props.variableNode)}
        sequenceUuid={""}
        resources={props.resources}
        allowedVariableNodes={AllowedVariableNodes.variable}
        hideGroups={true}
        variableType={determineVariableType(props.variableNode)}
        removeVariable={props.removeVariable}
        onChange={change(props.onChange, props.variableNode)} />
    </div>;
  } else {
    return <div className={"no-default-value-form"} />;
  }
};

const change =
  (onChange: OnChange, variable: VariableNode) =>
    (formResponse: ParameterApplication) => {
      const { data_value } = formResponse.args;
      if (data_value.kind !== "point_group") {
        onChange({
          kind: "parameter_declaration",
          args: {
            label: variable.args.label,
            default_value: data_value
          }
        }, variable.args.label);
      }
    };

const defaultValueVariableData = (
  resources: ResourceIndex,
  node: ParameterDeclaration,
): SequenceMeta => {
  const celeryNode: ParameterApplication = {
    kind: "parameter_application",
    args: { label: t("Default Value"), data_value: node.args.default_value }
  };
  return {
    celeryNode,
    vector: determineVector(celeryNode, resources),
    dropdown: determineDropdown(celeryNode, resources),
  };
};
