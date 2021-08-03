import React from "react";
import { Row, Col, FBSelect, Help } from "../../ui";
import { locationFormList, NO_VALUE_SELECTED_DDI } from "./location_form_list";
import { convertDDItoVariable } from "../locals_list/handle_select";
import {
  LocationFormProps, AllowedVariableNodes, VariableNode,
} from "../locals_list/locals_list_support";
import {
  determineVector, determineDropdown, SequenceMeta, determineVarDDILabel,
} from "../../resources/sequence_meta";
import { ResourceIndex, UUID } from "../../resources/interfaces";
import { DefaultValueForm } from "./default_value_form";
import { t } from "../../i18next_wrapper";
import { CoordinateInputBoxes } from "./location_form_coordinate_input_boxes";
import { ToolTips } from "../../constants";
import { generateNewVariableLabel } from "./locals_list";
import { shouldDisplayFeature } from "../../farmware/state_to_props";
import { Feature } from "../../devices/interfaces";

/**
 * If a variable with a matching label exists in local parameter applications
 * (step body, etc.), use it instead of the one in scope declarations.
 */
const maybeUseStepData = ({ resources, bodyVariables, variable, uuid }: {
  resources: ResourceIndex,
  bodyVariables: VariableNode[] | undefined,
  variable: SequenceMeta,
  uuid: UUID,
}): SequenceMeta => {
  const executeStepData = bodyVariables?.filter(v =>
    v.args.label === variable.celeryNode.args.label)[0];
  if (executeStepData) {
    return {
      celeryNode: executeStepData,
      vector: determineVector(executeStepData, resources, uuid),
      dropdown: determineDropdown(executeStepData, resources, uuid),
    };
  }
  return variable;
};

/**
 * Form with an "import from" dropdown and coordinate input boxes.
 * Can be used to set a specific value, import a value, or declare a variable.
 */
export const LocationForm =
  (props: LocationFormProps) => {
    const { sequenceUuid, resources, bodyVariables, variable,
      allowedVariableNodes, hideGroups } = props;
    const { celeryNode, dropdown, vector, isDefault } = maybeUseStepData({
      resources, bodyVariables, variable, uuid: sequenceUuid
    });
    const variableListItems = generateVariableListItems({
      allowedVariableNodes, bodyVariables, resources, sequenceUuid,
    });
    const displayGroups = !hideGroups;
    const unfiltered = locationFormList(resources, [], variableListItems,
      displayGroups);
    const list = props.customFilterRule
      ? unfiltered.filter(props.customFilterRule)
      : unfiltered;
    /** Variable name. */
    const { label } = celeryNode.args;
    if (variable.isDefault) {
      const defaultDDI = determineDropdown(variable.celeryNode, resources);
      defaultDDI.label = `${t("Default value")} - ${defaultDDI.label}`;
      list.unshift(defaultDDI);
    }
    const cleanLabel = label == "parent" ? t("Location variable") : label;
    const formTitle = props.hideTypeLabel ? label : cleanLabel;
    return <div className="location-form">
      {!props.hideHeader &&
        <div className="location-form-header">
          <label>{formTitle}</label>
          {isDefault &&
            <Help text={ToolTips.USING_DEFAULT_VARIABLE_VALUE}
              customIcon={"exclamation-triangle"} onHover={true} />}
          {props.collapsible &&
            <i className={`fa fa-caret-${props.collapsed ? "down" : "up"}`}
              onClick={props.toggleVarShow} />}
          {props.collapsible &&
            <i className={"fa fa-trash"}
              onClick={() => props.removeVariable?.(label)} />}
        </div>}
      {!props.collapsed &&
        <div className="location-form-content">
          <Row>
            <Col xs={12}>
              <FBSelect
                key={props.locationDropdownKey}
                list={list}
                selectedItem={dropdown}
                customNullLabel={NO_VALUE_SELECTED_DDI().label}
                onChange={ddi => {
                  props.onChange(convertDDItoVariable({
                    identifierLabel: label,
                    allowedVariableNodes,
                    dropdown: ddi
                  }));
                }} />
            </Col>
          </Row>
          <CoordinateInputBoxes
            variableNode={celeryNode}
            vector={vector}
            width={props.width}
            onChange={props.onChange} />
          <DefaultValueForm
            key={props.locationDropdownKey}
            variableNode={celeryNode}
            resources={resources}
            onChange={props.onChange} />
        </div>}
    </div>;
  };

interface GenerateVariableListItemsProps {
  allowedVariableNodes: AllowedVariableNodes;
  bodyVariables: VariableNode[] | undefined;
  resources: ResourceIndex;
  sequenceUuid: UUID;
}

const generateVariableListItems = (props: GenerateVariableListItemsProps) => {
  const { allowedVariableNodes, bodyVariables, resources, sequenceUuid } = props;
  const displayVariables = allowedVariableNodes !== AllowedVariableNodes.variable;
  const headerForm = allowedVariableNodes === AllowedVariableNodes.parameter;
  const newVarLabel = generateNewVariableLabel(bodyVariables || []);
  if (!displayVariables) { return []; }
  const oldVariables = bodyVariables?.map(variable_ => ({
    value: variable_.args.label,
    label: determineVarDDILabel({
      label: variable_.args.label,
      resources,
      uuid: sequenceUuid,
      forceExternal: headerForm,
    }),
    headingId: "Variable",
  })) || [];
  const newVariable = (shouldDisplayFeature(Feature.multiple_variables)
    || !bodyVariables || bodyVariables.length < 1)
    ? [{
      value: newVarLabel,
      label: determineVarDDILabel({
        label: newVarLabel,
        resources,
        uuid: sequenceUuid,
        forceExternal: headerForm,
      }),
      headingId: "Variable",
    }]
    : [];
  return oldVariables.concat(newVariable);
};
