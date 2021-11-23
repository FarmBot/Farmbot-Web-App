import React from "react";
import { Row, Col, FBSelect, Help, Color, BlurableInput } from "../../ui";
import {
  locationFormList, NO_VALUE_SELECTED_DDI, sortVariables,
} from "./location_form_list";
import { convertDDItoVariable } from "../locals_list/handle_select";
import {
  LocationFormProps, AllowedVariableNodes, VariableNode, OnChange,
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
import { error } from "../../toast/toast";
import { cloneDeep } from "lodash";
import { shouldDisplayFeature } from "../../devices/should_display";
import { Feature } from "../../devices/interfaces";
import { defensiveClone } from "../../util";
import { Numeric } from "farmbot";

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
      allowedVariableNodes, hideGroups, removeVariable, onChange } = props;
    const { celeryNode, dropdown, vector, isDefault } = maybeUseStepData({
      resources, bodyVariables, variable, uuid: sequenceUuid
    });
    const variableListItems = generateVariableListItems({
      allowedVariableNodes, resources, sequenceUuid,
    });
    const displayGroups = !hideGroups;
    const unfiltered = locationFormList(resources, [], variableListItems,
      displayGroups);
    const list = props.customFilterRule
      ? unfiltered.filter(props.customFilterRule)
      : unfiltered;
    /** Variable name. */
    const { label } = celeryNode.args;
    const headerForm = allowedVariableNodes === AllowedVariableNodes.parameter;
    if (headerForm) {
      list.unshift({
        value: label,
        label: determineVarDDILabel({
          label, resources, uuid: sequenceUuid, forceExternal: true,
        }),
        headingId: "Variable",
      });
    }
    if (variable.isDefault) {
      const defaultDDI = determineDropdown(variable.celeryNode, resources);
      defaultDDI.label = `${t("Default value")} - ${defaultDDI.label}`;
      list.unshift(defaultDDI);
    }
    return <div className="location-form">
      {!props.hideHeader &&
        <div className="location-form-header">
          <Label label={label} inUse={props.inUse || !removeVariable}
            variable={variable} onChange={onChange} />
          {isDefault &&
            <Help text={ToolTips.USING_DEFAULT_VARIABLE_VALUE}
              customIcon={"exclamation-triangle"} onHover={true} />}
          {props.collapsible &&
            <i className={`fa fa-caret-${props.collapsed ? "down" : "up"}`}
              onClick={props.toggleVarShow} />}
          {removeVariable &&
            <i className={"fa fa-trash"}
              style={props.inUse ? { color: Color.gray } : {}}
              onClick={() => removeVariable(label)} />}
          {shouldDisplayFeature(Feature.number_variables) &&
            <i className={"fa fa-list-ol"}
              onClick={() => onChange(convertDDItoVariable({
                identifierLabel: label,
                allowedVariableNodes,
                dropdown: { label: "", headingId: "Numeric", value: 0 },
              }), label)} />}
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
                  onChange(convertDDItoVariable({
                    identifierLabel: label,
                    allowedVariableNodes,
                    dropdown: ddi
                  }), label);
                }} />
            </Col>
          </Row>
          <NumericInput label={label} variable={variable} onChange={onChange} />
          <CoordinateInputBoxes
            variableNode={celeryNode}
            vector={vector}
            width={props.width}
            onChange={onChange} />
          <DefaultValueForm
            key={props.locationDropdownKey}
            variableNode={celeryNode}
            resources={resources}
            onChange={onChange} />
        </div>}
    </div>;
  };

export interface NumericInputProps {
  variable: SequenceMeta;
  onChange: OnChange;
  label: string;
}

export const NumericInput = (props: NumericInputProps) => {
  const variableNode = props.variable.celeryNode;
  return variableNode.kind == "variable_declaration" &&
    variableNode.args.data_value.kind == "numeric"
    ? <BlurableInput type={"number"}
      className={"numeric-input"}
      onCommit={e => {
        const editableVariable = defensiveClone(variableNode);
        (editableVariable.args.data_value as Numeric).args.number =
          parseFloat(e.currentTarget.value);
        props.onChange(editableVariable, props.label);
      }}
      value={variableNode.args.data_value.args.number} />
    : <div />;
};

interface LabelProps {
  label: string;
  inUse: boolean | undefined;
  variable: SequenceMeta;
  onChange: OnChange;
}

const Label = (props: LabelProps) => {
  const { label, inUse } = props;
  const [isEditingLabel, setIsEditingLabel] = React.useState(false);
  const [labelValue, setLabelValue] = React.useState(label);
  const formTitle = labelValue == "parent" ? t("Location variable") : labelValue;
  return isEditingLabel
    ? <input value={labelValue}
      autoFocus={true}
      onBlur={() => {
        setIsEditingLabel(false);
        const editableVariable = cloneDeep(props.variable.celeryNode);
        editableVariable.args.label = labelValue;
        props.onChange(editableVariable, label);
      }}
      onChange={e => {
        setLabelValue(e.currentTarget.value);
      }} />
    : <label
      title={inUse ? "" : t("click to edit")}
      onClick={() => inUse
        ? error(t("Can't edit variable name while in use."))
        : setIsEditingLabel(true)}>
      {formTitle}
    </label>;
};

export interface GenerateVariableListProps {
  allowedVariableNodes: AllowedVariableNodes;
  resources: ResourceIndex;
  sequenceUuid: UUID;
  headingId?: string;
}

export const generateVariableListItems = (props: GenerateVariableListProps) => {
  const { allowedVariableNodes, resources, sequenceUuid } = props;
  const headingId = props.headingId || "Variable";
  const variables = sortVariables(Object.values(
    resources.sequenceMetas[sequenceUuid] || [])).map(v => v.celeryNode);
  const displayVariables = allowedVariableNodes !== AllowedVariableNodes.variable;
  if (!displayVariables) { return []; }
  const headerForm = allowedVariableNodes === AllowedVariableNodes.parameter;
  if (headerForm) { return []; }
  const oldVariables = variables.map(variable_ => ({
    value: variable_.args.label,
    label: determineVarDDILabel({
      label: variable_.args.label,
      resources,
      uuid: sequenceUuid,
    }),
    headingId,
  }));
  const newVarLabel = generateNewVariableLabel(variables);
  const newVariable = [{
    value: newVarLabel,
    label: determineVarDDILabel({
      label: newVarLabel,
      resources,
      uuid: sequenceUuid,
    }),
    headingId,
  }];
  return oldVariables.concat(newVariable);
};
