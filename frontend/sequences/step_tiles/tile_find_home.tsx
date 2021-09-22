import React from "react";
import { FindHome } from "farmbot";
import { StepParams } from "../interfaces";
import { ToolTips, Content } from "../../constants";
import { StepWrapper, StepWarning, conflictsString } from "../step_ui";
import { some } from "lodash";
import { AxisStepRadio } from "../step_ui/step_radio";
import { settingConflicts } from "./tile_calibrate";

export const TileFindHome = (props: StepParams<FindHome>) => {
  const { dispatch, index, currentStep, currentSequence } = props;
  const conflicts = settingConflicts(currentStep, props.hardwareFlags);
  return <StepWrapper {...props}
    className={"find-home-step"}
    helpText={ToolTips.FIND_HOME}
    warning={some(conflicts) &&
      <StepWarning
        warning={Content.END_DETECTION_DISABLED + conflictsString(conflicts)}
        conflicts={conflicts} />}>
    <AxisStepRadio
      currentSequence={currentSequence}
      currentStep={currentStep}
      dispatch={dispatch}
      index={index} />
  </StepWrapper>;
};
