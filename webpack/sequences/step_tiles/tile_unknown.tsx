import * as React from "react";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui";
import { Col, Row } from "../../ui/index";
import { t } from "i18next";

export function TileUnknown(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence } = props;
  const className = "unknown-step";
  return <StepWrapper>
    <StepHeader
      className={className}
      helpText={ToolTips.UNKNOWN_STEP}
      currentSequence={currentSequence}
      currentStep={currentStep}
      dispatch={dispatch}
      index={index}
      confirmStepDeletion={props.confirmStepDeletion} />
    <StepContent className={className}>
      <Row>
        <Col xs={12}>
          <p>{t(ToolTips.UNKNOWN_STEP)}</p>
          <code>{JSON.stringify(currentStep)}</code>
        </Col>
      </Row>
    </StepContent>
  </StepWrapper>;
}
