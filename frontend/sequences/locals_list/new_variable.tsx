import { Numeric, ResourcePlaceholder, Text } from "farmbot";
import React from "react";
import { t } from "../../i18next_wrapper";
import { NOTHING } from "./handle_select";
import { VariableNode, VariableType } from "./locals_list_support";

const locationLabel = (num: number) => t("Location {{ num }}", { num });
const numberLabel = (num: number) => t("Number {{ num }}", { num });
const textLabel = (num: number) => t("Text {{ num }}", { num });
const resourceLabel = (num: number) => t("Resource {{ num }}", { num });

export const newVariableLabel = (variableType: VariableType) => {
  switch (variableType) {
    case VariableType.Location: return locationLabel;
    case VariableType.Number: return numberLabel;
    case VariableType.Text: return textLabel;
    case VariableType.Resource: return resourceLabel;
  }
};

export const varTypeFromLabel = (label: string) => {
  if (label.startsWith(t("Location"))) { return VariableType.Location; }
  if (label.startsWith(t("Number"))) { return VariableType.Number; }
  if (label.startsWith(t("Text"))) { return VariableType.Text; }
  if (label.startsWith(t("Resource"))) { return VariableType.Resource; }
};

export const newVariableDataValue = (variableType: VariableType | undefined):
  Numeric | Text | ResourcePlaceholder => {
  switch (variableType) {
    default:
    case VariableType.Location: return NOTHING;
    case VariableType.Number: return { kind: "numeric", args: { number: 0 } };
    case VariableType.Text: return { kind: "text", args: { string: "" } };
    case VariableType.Resource: return {
      kind: "resource_placeholder",
      args: { resource_type: "Sequence" },
    };
  }
};

const isNumeric = (variableNode: VariableNode) =>
  ((variableNode.kind == "variable_declaration" ||
    variableNode.kind == "parameter_application") &&
    ["numeric", "number_placeholder"]
      .includes(variableNode.args.data_value.kind)) ||
  (variableNode.kind == "parameter_declaration" &&
    ["numeric", "number_placeholder"]
      .includes(variableNode.args.default_value.kind));

const isText = (variableNode: VariableNode) =>
  ((variableNode.kind == "variable_declaration" ||
    variableNode.kind == "parameter_application") &&
    ["text", "text_placeholder"]
      .includes(variableNode.args.data_value.kind)) ||
  (variableNode.kind == "parameter_declaration" &&
    ["text", "text_placeholder"]
      .includes(variableNode.args.default_value.kind));

const isResource = (variableNode: VariableNode) =>
  ((variableNode.kind == "variable_declaration" ||
    variableNode.kind == "parameter_application") &&
    ["resource", "resource_placeholder"]
      .includes(variableNode.args.data_value.kind)) ||
  (variableNode.kind == "parameter_declaration" &&
    ["resource", "resource_placeholder"]
      .includes(variableNode.args.default_value.kind));

export const determineVariableType = (variableNode: VariableNode) => {
  if (isNumeric(variableNode)) { return VariableType.Number; }
  if (isText(variableNode)) { return VariableType.Text; }
  if (isResource(variableNode)) { return VariableType.Resource; }
  return VariableType.Location;
};

export interface VariableIconProps {
  variableType: VariableType;
}

export const VariableIcon = (props: VariableIconProps) => {
  const iconClass = () => {
    switch (props.variableType) {
      case VariableType.Location: return "fa-crosshairs";
      case VariableType.Number: return "fa-hashtag";
      case VariableType.Text: return "fa-font";
      case VariableType.Resource: return "fa-hdd-o";
    }
  };
  return <i className={`fa ${iconClass()} variable-icon`} />;
};
