import * as React from "react";
import { Row, Col, FBSelect, BlurableInput } from "../../ui";
import { t } from "i18next";
import { locationFormList, NO_VALUE_SELECTED_DDI } from "./location_form_list";
import { convertDDItoDeclaration } from "../locals_list/handle_select";
import {
  LocationFormProps, PARENT, AllowedDeclaration,
} from "../locals_list/locals_list_support";
import { defensiveClone } from "../../util/util";
import { Xyz, ScopeDeclarationBodyItem } from "farmbot";
import {
  determineVector, determineDropdown, determineEditable, SequenceMeta
} from "../../resources/sequence_meta";
import { ResourceIndex, UUID } from "../../resources/interfaces";
import { Feature } from "../../devices/interfaces";

/** For LocationForm coordinate input boxes.  */
export interface AxisEditProps {
  axis: Xyz;
  onChange: (sd: ScopeDeclarationBodyItem) => void;
  declaration: ScopeDeclarationBodyItem;
}

/** Update a VariableDeclaration coordinate. */
export const manuallyEditAxis = (props: AxisEditProps) =>
  (e: React.SyntheticEvent<HTMLInputElement>) => {
    const { axis, onChange, declaration } = props;
    const num = parseFloat(e.currentTarget.value);
    if (declaration.kind === "variable_declaration" &&
      declaration.args.data_value.kind === "coordinate") {
      declaration.args.data_value.args[axis] = num;
      !isNaN(num) && onChange(declaration);
    }
  };

/**
 * If a declaration with a matching label exists in local `declarations`
 * (step body, etc.), use it instead of the one in scope declarations.
 */
const maybeUseStepData = ({ resources, declarations, variable, uuid }: {
  resources: ResourceIndex,
  declarations: ScopeDeclarationBodyItem[] | undefined,
  variable: SequenceMeta,
  uuid: UUID,
}): SequenceMeta => {
  if (declarations) {
    const executeStepData = declarations
      .filter(v => v.args.label === variable.celeryNode.args.label)[0];
    if (executeStepData) {
      return {
        celeryNode: executeStepData,
        vector: determineVector(executeStepData, resources, uuid),
        dropdown: determineDropdown(executeStepData, resources),
      };
    }
  }
  return variable;
};

/**
 * Form with an "import from" dropdown and coordinate display/input boxes.
 * Can be used to set a specific value, import a value, or declare a variable.
 */
export const LocationForm =
  (props: LocationFormProps) => {
    const {
      sequenceUuid, resources, onChange, declarations, variable,
      hideVariableLabel, locationDropdownKey, allowedDeclarations,
      disallowGroups
    } = props;
    const { celeryNode, dropdown, vector } =
      maybeUseStepData({
        resources, declarations, variable, uuid: sequenceUuid
      });
    /** For disabling coordinate input boxes when using external data. */
    const isDisabled = !determineEditable(celeryNode);
    const useIdentifier = allowedDeclarations === AllowedDeclaration.identifier;
    const variableListItems = (props.shouldDisplay(Feature.variables) &&
      allowedDeclarations !== AllowedDeclaration.variable) ? [PARENT] : [];
    const list = locationFormList(resources, variableListItems, !disallowGroups);
    /** Variable name. */
    const { label } = celeryNode.args;
    const declaration = defensiveClone(celeryNode);
    const axisPartialProps = { onChange, declaration };
    const formTitle = hideVariableLabel
      ? t("Location")
      : `${label} (${t("Location")})`;
    return <div className="location-form">
      <Row>
        <Col xs={12}>
          <label>{formTitle}</label>
          <FBSelect
            key={locationDropdownKey}
            list={list}
            selectedItem={dropdown}
            customNullLabel={NO_VALUE_SELECTED_DDI.label}
            onChange={ddi =>
              onChange(convertDDItoDeclaration({ label, useIdentifier })(ddi))} />
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
    </div>;
  };
