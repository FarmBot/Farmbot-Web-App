import * as React from "react";
import { Row, Col, FBSelect, BlurableInput, DropDownItem } from "../../ui";
import { locationFormList, NO_VALUE_SELECTED_DDI } from "./location_form_list";
import { convertDDItoVariable } from "../locals_list/handle_select";
import {
  LocationFormProps, PARENT, AllowedVariableNodes, VariableNode,
} from "../locals_list/locals_list_support";
import { defensiveClone } from "../../util/util";
import { Xyz } from "farmbot";
import {
  determineVector, determineDropdown, determineEditable, SequenceMeta
} from "../../resources/sequence_meta";
import { ResourceIndex, UUID } from "../../resources/interfaces";
import { Feature } from "../../devices/interfaces";
import { DefaultValueForm } from "./default_value_form";
import { t } from "../../i18next_wrapper";

/** For LocationForm coordinate input boxes.  */
export interface AxisEditProps {
  axis: Xyz;
  onChange: (sd: VariableNode) => void;
  editableVariable: VariableNode;
}

/** Update a ParameterApplication coordinate. */
export const manuallyEditAxis = (props: AxisEditProps) =>
  (e: React.SyntheticEvent<HTMLInputElement>) => {
    const { axis, onChange, editableVariable } = props;
    const num = parseFloat(e.currentTarget.value);
    if (editableVariable.kind !== "parameter_declaration" &&
      editableVariable.args.data_value.kind === "coordinate") {
      editableVariable.args.data_value.args[axis] = num;
      !isNaN(num) && onChange(editableVariable);
    }
  };

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

const listLabelDDI = (ddi: DropDownItem) => {
  const newDDI = Object.assign({}, ddi);
  newDDI.label = ddi.isNull ? t("Location Variable - Add new") : newDDI.label;
  return newDDI;
};

const selectedLabelDDI = (ddi: DropDownItem, override?: string) => {
  const newDDI = Object.assign({}, ddi);
  newDDI.label = (ddi.value === "parameter_declaration" && override)
    ? override : newDDI.label;
  return newDDI;
};

/**
 * Form with an "import from" dropdown and coordinate display/input boxes.
 * Can be used to set a specific value, import a value, or declare a variable.
 */
export const LocationForm =
  (props: LocationFormProps) => {
    const {
      sequenceUuid, resources, onChange, bodyVariables, variable,
      locationDropdownKey, allowedVariableNodes, disallowGroups, listVarLabel
    } = props;
    const { celeryNode, dropdown, vector } =
      maybeUseStepData({
        resources, bodyVariables, variable, uuid: sequenceUuid
      });
    /** For disabling coordinate input boxes when using external data. */
    const isDisabled = !determineEditable(celeryNode);
    const variableListItems = (props.shouldDisplay(Feature.variables) &&
      allowedVariableNodes !== AllowedVariableNodes.variable)
      ? [PARENT(listVarLabel || listLabelDDI(dropdown).label)]
      : [];
    const displayGroups = props.shouldDisplay(Feature.loops) && !disallowGroups;
    const list = locationFormList(resources, variableListItems, displayGroups);
    /** Variable name. */
    const { label } = celeryNode.args;
    const editableVariable = defensiveClone(celeryNode);
    const axisPartialProps = { onChange, editableVariable };
    const formTitleWithType =
      props.hideVariableLabel ? t("Location") : `${label} (${t("Location")})`;
    const formTitle = props.hideTypeLabel ? label : formTitleWithType;
    return <div className="location-form">
      <div className="location-form-header">
        <label>{formTitle}</label>
        {props.collapsible &&
          <i className={`fa fa-caret-${props.collapsed ? "down" : "up"}`}
            onClick={props.toggleVarShow} />}
      </div>
      {!props.collapsed &&
        <div className="location-form-content">
          <Row>
            <Col xs={12}>
              <FBSelect
                key={locationDropdownKey}
                list={list}
                selectedItem={selectedLabelDDI(dropdown, listVarLabel)}
                customNullLabel={NO_VALUE_SELECTED_DDI().label}
                onChange={ddi => onChange(convertDDItoVariable({
                  label, allowedVariableNodes
                })(ddi))} />
            </Col>
          </Row>
          {vector &&
            <Row>
              {["x", "y", "z"].map((axis: Xyz) =>
                <Col xs={props.width || 4} key={axis}>
                  <label>
                    {t("{{axis}} (mm)", { axis })}
                  </label>
                  <BlurableInput type="number"
                    disabled={isDisabled}
                    onCommit={manuallyEditAxis({ ...axisPartialProps, axis })}
                    name={`location-${axis}`}
                    value={"" + vector[axis]} />
                </Col>)}
            </Row>}
          <DefaultValueForm
            variableNode={celeryNode}
            resources={resources}
            onChange={onChange} />
        </div>}
    </div>;
  };
