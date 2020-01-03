import * as React from "react";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { t } from "../../i18next_wrapper";
import { AxisStepRadio } from "../step_ui/step_radio";
import { Zero } from "farmbot";

export function TileSetZero(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence } = props;
  const className = "set-zero-step";
  return <StepWrapper>
    <StepHeader
      className={className}
      helpText={ToolTips.SET_ZERO_POSITION}
      currentSequence={currentSequence}
      currentStep={currentStep}
      dispatch={dispatch}
      index={index}
      confirmStepDeletion={props.confirmStepDeletion} />
    <StepContent className={className}>
      <AxisStepRadio
        currentSequence={currentSequence}
        currentStep={currentStep as Zero}
        dispatch={dispatch}
        index={index}
        label={t("Zero")} />
    </StepContent>
  </StepWrapper>;
}
