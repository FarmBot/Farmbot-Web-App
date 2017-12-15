import * as React from "react";
import { StepParams } from "../interfaces";
import { t } from "i18next";
import { ToolTips } from "../../constants";
import { StepInputBox } from "../inputs/step_input_box";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row, Col } from "../../ui/index";

export function TileExecuteScript({
  dispatch, currentStep, index, currentSequence }: StepParams) {
  if (currentStep.kind === "execute_script") {
    const className = "execute-script-step";
    return <StepWrapper>
      <StepHeader
        className={className}
        helpText={ToolTips.EXECUTE_SCRIPT}
        currentSequence={currentSequence}
        currentStep={currentStep}
        dispatch={dispatch}
        index={index} />
      <StepContent className={className}>
        <Row>
          <Col xs={12}>
            <label>{t("Package Name")}</label>
            <StepInputBox dispatch={dispatch}
              index={index}
              step={currentStep}
              sequence={currentSequence}
              field="label" />
          </Col>
        </Row>
      </StepContent>
    </StepWrapper>;
  } else {
    return <p> ERROR </p>;
  }
}
