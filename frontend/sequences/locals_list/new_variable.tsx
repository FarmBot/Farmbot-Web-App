import React from "react";
import { t } from "../../i18next_wrapper";
import { NOTHING_SELECTED } from "./handle_select";
import { VariableNode, VariableType } from "./locals_list_support";

const locationLabel = (num: number) => t("Location {{ num }}", { num });
const numberLabel = (num: number) => t("Number {{ num }}", { num });
const textLabel = (num: number) => t("Text {{ num }}", { num });

export const newVariableLabel = (variableType: VariableType) => {
  switch (variableType) {
    case VariableType.Location: return locationLabel;
    case VariableType.Number: return numberLabel;
    case VariableType.Text: return textLabel;
  }
};

export const varTypeFromLabel = (label: string) => {
  if (label.startsWith(t("Location"))) { return VariableType.Location; }
  if (label.startsWith(t("Number"))) { return VariableType.Number; }
  if (label.startsWith(t("Text"))) { return VariableType.Text; }
};

export const newVariableDataValue = (variableType: VariableType | undefined) => {
  switch (variableType) {
    default:
    case VariableType.Location: return NOTHING_SELECTED;
    case VariableType.Number: return { kind: "numeric", args: { number: 0 } };
    case VariableType.Text: return { kind: "text", args: { string: "" } };
  }
};

export const isNumeric = (variableNode: VariableNode) =>
  ((variableNode.kind == "variable_declaration" ||
    variableNode.kind == "parameter_application") &&
    variableNode.args.data_value.kind == "numeric") ||
  (variableNode.kind == "parameter_declaration" &&
    variableNode.args.default_value.kind == "numeric");

export const isText = (variableNode: VariableNode) =>
  ((variableNode.kind == "variable_declaration" ||
    variableNode.kind == "parameter_application") &&
    variableNode.args.data_value.kind == "text") ||
  (variableNode.kind == "parameter_declaration" &&
    variableNode.args.default_value.kind == "text");

export const determineVariableType = (variableNode: VariableNode) => {
  if (isNumeric(variableNode)) { return VariableType.Number; }
  if (isText(variableNode)) { return VariableType.Text; }
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
    }
  };
  return <i className={`fa ${iconClass()} variable-icon`} />;
};
