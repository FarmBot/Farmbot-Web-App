import * as React from "react";
import { Row, Col, FBSelect, DropDownItem } from "../../ui";
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

const hideGroups = (x: DropDownItem) => x.headingId !== "PointGroup";
const allowAll = (_: unknown) => true;

type DropdownKeys =
  | "allowedVariableNodes"
  | "shouldDisplay"
  | "resources"
  | "sequenceUuid"
  | "variable";

type DropdownGenerationProps = Pick<LocationFormProps, DropdownKeys>;

function generateDropdownList(p: DropdownGenerationProps): DropDownItem[] {
  const displayVariables = p.shouldDisplay(Feature.variables) &&
    p.allowedVariableNodes !== AllowedVariableNodes.variable;
  const list: DropDownItem[] = [];

  if (p.variable.default) {
    const defaultDDI = determineDropdown(p.variable.celeryNode, p.resources);
    defaultDDI.label = `${t("Default value")} - ${defaultDDI.label}`;
    list.push(defaultDDI);
  }

  if (displayVariables) {
    list.push(PARENT(determineVarDDILabel({
      label: "parent",
      resources: p.resources,
      uuid: p.sequenceUuid,
      forceExternal: p.allowedVariableNodes ===
        AllowedVariableNodes.parameter
    })));
  }

  return list;
}

/**
 * Form with an "import from" dropdown and coordinate input boxes.
 * Can be used to set a specific value, import a value, or declare a variable.
 */
export const LocationForm = (p: LocationFormProps) => {
  const meta = maybeUseStepData({
    resources: p.resources,
    bodyVariables: p.bodyVariables,
    variable: p.variable,
    uuid: p.sequenceUuid
  });

  const filter = p.hideGroups ? hideGroups : allowAll;
  const list =
    locationFormList(p.resources, generateDropdownList(p)).filter(filter);
  /** Variable name. */
  const { label } = meta.celeryNode.args;
  const formTitleWithType =
    p.hideVariableLabel ? t("Location") : `${label} (${t("Location")})`;
  const formTitle = p.hideTypeLabel ? label : formTitleWithType;
  return <div className="location-form">
    {!p.hideHeader &&
      <div className="location-form-header">
        <label>{formTitle}</label>
        {p.collapsible &&
          <i className={`fa fa-caret-${p.collapsed ? "down" : "up"}`}
            onClick={p.toggleVarShow} />}
      </div>}
    {!p.collapsed && <div className="location-form-content">
      <Row>
        <Col xs={12}>
          <FBSelect
            key={p.locationDropdownKey}
            list={list}
            selectedItem={meta.dropdown}
            customNullLabel={NO_VALUE_SELECTED_DDI().label}
            onChange={ddi => {
              p.onChange(convertDDItoVariable({
                identifierLabel: label,
                allowedVariableNodes: p.allowedVariableNodes,
                dropdown: ddi
              }));
            }} />
        </Col>
      </Row>
      <CoordinateInputBoxes
        variableNode={meta.celeryNode}
        vector={meta.vector}
        width={p.width}
        onChange={p.onChange} />
      <DefaultValueForm
        variableNode={meta.celeryNode}
        resources={p.resources}
        onChange={p.onChange} />
    </div>}
  </div>;
};
