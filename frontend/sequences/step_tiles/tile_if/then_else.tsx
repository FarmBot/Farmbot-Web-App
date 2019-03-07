import * as React from "react";
import { ThenElseParams, seqDropDown, IfBlockDropDownHandler } from "./index";
import { t } from "i18next";
import { Row, Col, FBSelect } from "../../../ui";
import { LocalsList } from "../../locals_list/locals_list";
import { AllowedVariableNodes } from "../../locals_list/locals_list_support";

export function ThenElse(props: ThenElseParams) {
  const {
    onChange, selectedItem, calledSequenceVariableData, assignVariable
  } = IfBlockDropDownHandler(props);
  const { body } = props.currentStep.args[props.thenElseKey];
  return <Row>
    <Col xs={12} md={12}>
      <h4>{props.thenElseKey === "_then" ? t("THEN...") : t("ELSE...")}</h4>
    </Col>
    <Col xs={12} md={12}>
      <label>{t("Execute Sequence")}</label>
      <FBSelect
        key={JSON.stringify(props.currentSequence)}
        allowEmpty={true}
        list={seqDropDown(props.resources)}
        placeholder="Sequence..."
        onChange={onChange}
        selectedItem={selectedItem()} />
      {!!calledSequenceVariableData &&
        <Col xs={12}>
          <LocalsList
            bodyVariables={body}
            variableData={calledSequenceVariableData}
            sequenceUuid={props.currentSequence.uuid}
            resources={props.resources}
            onChange={assignVariable(body || [])}
            locationDropdownKey={JSON.stringify(props.currentSequence)}
            allowedVariableNodes={AllowedVariableNodes.identifier}
            shouldDisplay={props.shouldDisplay || (() => false)} />
        </Col>}
    </Col>
  </Row>;
}
