import * as React from "react";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row, Col } from "../../ui/index";
import { t } from "../../i18next_wrapper";

export function TileFirmwareAction(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence } = props;
  const className = "firmware-action-step";
  return <StepWrapper>
    <StepHeader
      className={className}
      helpText={ToolTips.FIRMWARE_ACTION}
      currentSequence={currentSequence}
      currentStep={currentStep}
      dispatch={dispatch}
      index={index}
      confirmStepDeletion={props.confirmStepDeletion} />
    <StepContent className={className}>
      <Row>
        <Col xs={12}>
          <label>{t("System")}</label>
          <StepInputBox dispatch={dispatch}
            step={currentStep}
            sequence={currentSequence}
            index={index}
            fieldOverride={true}
            field={"package"} />
        </Col>
      </Row>
    </StepContent>
  </StepWrapper>;
}
