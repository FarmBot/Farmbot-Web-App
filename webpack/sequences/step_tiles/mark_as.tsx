import * as React from "react";
import { t } from "i18next";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row, Col, FBSelect } from "../../ui/index";

export function MarkAs({
  dispatch, currentStep, index, currentSequence }: StepParams) {
  const className = "wait-step";
  return <StepWrapper>
    <StepHeader
      className={className}
      helpText={ToolTips.WAIT}
      currentSequence={currentSequence}
      currentStep={currentStep}
      dispatch={dispatch}
      index={index} />
    <StepContent className={className}>
      <Row>
        <Col xs={4}>
          <label>{t("Mark")}</label>
          <FBSelect
            list={[]}
            placeholder="Foo"
            onChange={() => { }}
            selectedItem={{ label: "Plant", value: 0 }} />
        </Col>
        <Col xs={4}>
          <label>{t("As")}</label>
          <FBSelect
            list={[]}
            placeholder="Foo"
            onChange={() => { }}
            selectedItem={undefined} />
        </Col>
        <Col xs={4} />
      </Row>
    </StepContent>
  </StepWrapper>;

}
