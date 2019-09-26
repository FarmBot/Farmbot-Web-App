import * as React from "react";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row, Col } from "../../ui/index";
import { t } from "../../i18next_wrapper";

export function TileSetServoAngle(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence } = props;
  const className = "set-servo-angle-step";
  return <StepWrapper>
    <StepHeader
      className={className}
      helpText={ToolTips.SET_SERVO_ANGLE}
      currentSequence={currentSequence}
      currentStep={currentStep}
      dispatch={dispatch}
      index={index}
      confirmStepDeletion={props.confirmStepDeletion} />
    <StepContent className={className}>
      <Row>
        <Col xs={12}>
          <label>{t("Servo pin")}</label>
          <StepInputBox dispatch={dispatch}
            step={currentStep}
            sequence={currentSequence}
            index={index}
            field={"pin_number"} />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <label>{t("Servo angle (0-180)")}</label>
          <StepInputBox dispatch={dispatch}
            step={currentStep}
            sequence={currentSequence}
            index={index}
            field={"pin_value"} />
        </Col>
      </Row>
    </StepContent>
  </StepWrapper>;

}
