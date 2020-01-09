import * as React from "react";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { Row } from "../../ui/index";
import { PinSelect } from "./tile_write_pin";

export function TileTogglePin(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence } = props;
  const className = "write-pin-step";
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
        <PinSelect {...props} width={6} />
      </Row>
    </StepContent>
  </StepWrapper>;
}
