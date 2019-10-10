import * as React from "react";
import { Row, Col, FBSelect } from "../../ui";
import { locationFormList, NO_VALUE_SELECTED_DDI } from "./location_form_list";
import { convertDDItoVariable } from "../locals_list/handle_select";
import {
  LocationFormProps, PARENT, AllowedVariableNodes, VariableNode,
} from "../locals_list/locals_list_support";
import {
  determineVector, determineDropdown, SequenceMeta, determineVarDDILabel,
} from "../../resources/sequence_meta";
import { ResourceIndex, UUID } from "../../resources/interfaces";
import { Feature } from "../../devices/interfaces";
import { DefaultValueForm } from "./default_value_form";
import { t } from "../../i18next_wrapper";
import { CoordinateInputBoxes } from "./location_form_coordinate_input_boxes";

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
  if (bodyVariables) {
    const executeStepData = bodyVariables
      .filter(v => v.args.label === variable.celeryNode.args.label)[0];
    if (executeStepData) {
      return {
        celeryNode: executeStepData,
        vector: determineVector(executeStepData, resources, uuid),
        dropdown: determineDropdown(executeStepData, resources, uuid),
      };
    }
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
      allowedVariableNodes } = props;
    const { celeryNode, dropdown, vector } = maybeUseStepData({
      resources, bodyVariables, variable, uuid: sequenceUuid
    });
    const displayVariables = props.shouldDisplay(Feature.variables) &&
      allowedVariableNodes !== AllowedVariableNodes.variable;
    const headerForm = allowedVariableNodes === AllowedVariableNodes.parameter;
    const variableListItems = displayVariables ? [PARENT(determineVarDDILabel({
      label: "parent", resources, uuid: sequenceUuid, forceExternal: headerForm
    }))] : [];
    const list = locationFormList(resources, variableListItems, false);
    /** Variable name. */
    const { label } = celeryNode.args;
    if (variable.default) {
      const defaultDDI = determineDropdown(variable.celeryNode, resources);
      defaultDDI.label = `${t("Default value")} - ${defaultDDI.label}`;
      list.unshift(defaultDDI);
    }
    const formTitleWithType =
      props.hideVariableLabel ? t("Location") : `${label} (${t("Location")})`;
    const formTitle = props.hideTypeLabel ? label : formTitleWithType;
    return <div className="location-form">
      {!props.hideHeader &&
        <div className="location-form-header">
          <label>{formTitle}</label>
          {props.collapsible &&
            <i className={`fa fa-caret-${props.collapsed ? "down" : "up"}`}
              onClick={props.toggleVarShow} />}
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
            variableNode={celeryNode}
            resources={resources}
            onChange={props.onChange} />
        </div>}
    </div>;
  };
