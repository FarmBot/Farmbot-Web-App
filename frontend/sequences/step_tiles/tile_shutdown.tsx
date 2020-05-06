import * as React from "react";
import { StepParams } from "../interfaces";
import { Content } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { t } from "../../i18next_wrapper";

export function TileShutdown(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence } = props;
  const className = "shutdown-step";
  return <StepWrapper>
    <StepHeader
      className={className}
      helpText={Content.SHUTDOWN_FARMBOT}
      currentSequence={currentSequence}
      currentStep={currentStep}
      dispatch={dispatch}
      index={index}
      confirmStepDeletion={props.confirmStepDeletion} />
    <StepContent className={className}>
      <p>{t(Content.SHUTDOWN_STEP)}</p>
    </StepContent>
  </StepWrapper>;
}
