import * as React from "react";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row, Col } from "../../ui/index";
import { t } from "../../i18next_wrapper";
import { PinModeDropdown, PinSelect } from "./pin_support";

export function TileReadPin(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence
  } = props;
  const className = "read-pin-step";
  if (currentStep.kind !== "read_pin") { throw new Error("never"); }
  return <StepWrapper>
    <StepHeader
      className={className}
      helpText={ToolTips.READ_PIN}
      currentSequence={currentSequence}
      currentStep={currentStep}
      dispatch={dispatch}
      index={index}
      confirmStepDeletion={props.confirmStepDeletion} />
    <StepContent className={className}>
      <Row>
        <PinSelect {...props}
          label={t("sensor or peripheral")}
          placeholder={t("Select a sensor")} />
        <PinModeDropdown {...props} />
        <Col xs={6} md={3}>
          <label>{t("Data Label")}</label>
          <StepInputBox dispatch={dispatch}
            index={index}
            step={currentStep}
            sequence={currentSequence}
            field="label" />
        </Col>
      </Row>
    </StepContent>
  </StepWrapper>;
}
