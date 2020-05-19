import * as React from "react";
import { StepParams } from "../interfaces";
import { ToolTips, Content } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui";
import { Col, Row } from "../../ui/index";
import { t } from "../../i18next_wrapper";

export function TileEmergencyStop(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence } = props;
  const className = "emergency-stop-step";
  return <StepWrapper>
    <StepHeader
      className={className}
      helpText={ToolTips.EMERGENCY_LOCK}
      currentSequence={currentSequence}
      currentStep={currentStep}
      dispatch={dispatch}
      index={index}
      confirmStepDeletion={props.confirmStepDeletion} />
    <StepContent className={className}>
      <Row>
        <Col xs={12}>
          <p>
            {t(Content.ESTOP_STEP)}
          </p>
        </Col>
      </Row>
    </StepContent>
  </StepWrapper>;
}
