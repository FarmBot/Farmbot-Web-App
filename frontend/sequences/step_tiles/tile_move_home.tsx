import * as React from "react";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { StepRadio } from "../step_ui/step_radio";
import { t } from "i18next";
import { StepInputBox } from "../inputs/step_input_box";
import { Row, Col } from "../../ui";

export function TileMoveHome(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence } = props;
  const className = "move-home-step";
  return <StepWrapper>
    <StepHeader
      className={className}
      helpText={ToolTips.MOVE_TO_HOME}
      currentSequence={currentSequence}
      currentStep={currentStep}
      dispatch={dispatch}
      index={index}
      confirmStepDeletion={props.confirmStepDeletion} />
    <StepContent className={className}>
      <StepRadio
        currentSequence={currentSequence}
        currentStep={currentStep}
        dispatch={dispatch}
        index={index}
        label={t("Home")} />
      <Row>
        <Col xs={12}>
          <label>{t("Speed")}</label>
          <StepInputBox dispatch={dispatch}
            step={currentStep}
            sequence={currentSequence}
            index={index}
            field={"speed"} />
        </Col>
      </Row>
    </StepContent>
  </StepWrapper>;
}
