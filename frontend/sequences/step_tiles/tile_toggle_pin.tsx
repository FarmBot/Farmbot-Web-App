import * as React from "react";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row, Col } from "../../ui/index";
import { t } from "../../i18next_wrapper";

export function TileTogglePin(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence } = props;
  const className = "toggle-pin-step";
  return <StepWrapper>
    <StepHeader
      className={className}
      helpText={ToolTips.TOGGLE_PIN}
      currentSequence={currentSequence}
      currentStep={currentStep}
      dispatch={dispatch}
      index={index}
      confirmStepDeletion={props.confirmStepDeletion} />
    <StepContent className={className}>
      <Row>
        <Col xs={12}>
          <label>{t("Pin")}</label>
          <StepInputBox dispatch={dispatch}
            step={currentStep}
            sequence={currentSequence}
            index={index}
            field={"pin_number"} />
        </Col>
      </Row>
    </StepContent>
  </StepWrapper>;
}
