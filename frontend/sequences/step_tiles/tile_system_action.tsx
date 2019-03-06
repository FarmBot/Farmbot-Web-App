import * as React from "react";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";

export function TileSystemAction(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence } = props;
  const className = "system-action-step";
  return <StepWrapper>
    <StepHeader
      className={className}
      helpText={ToolTips.SYSTEM_ACTION}
      currentSequence={currentSequence}
      currentStep={currentStep}
      dispatch={dispatch}
      index={index}
      confirmStepDeletion={props.confirmStepDeletion} />
    <StepContent className={className} />
  </StepWrapper>;

}
