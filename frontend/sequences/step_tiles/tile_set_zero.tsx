import React from "react";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper } from "../step_ui";
import { t } from "../../i18next_wrapper";
import { AxisStepRadio } from "../step_ui/step_radio";
import { Zero } from "farmbot";

export const TileSetZero = (props: StepParams<Zero>) =>
  <StepWrapper {...props}
    className={"set-zero-step"}
    helpText={ToolTips.SET_HOME_POSITION}>
    <AxisStepRadio
      currentSequence={props.currentSequence}
      currentStep={props.currentStep}
      dispatch={props.dispatch}
      index={props.index}
      label={t("Set Home")} />
  </StepWrapper>;
