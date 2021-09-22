import React from "react";
import { StepParams, HardwareFlags } from "../interfaces";
import { ToolTips, Content } from "../../constants";
import { StepWrapper, conflictsString, StepWarning } from "../step_ui";
import { AxisStepRadio } from "../step_ui/step_radio";
import { Xyz, Calibrate, FindHome } from "farmbot";
import { some } from "lodash";

export const TileCalibrate = (props: StepParams<Calibrate>) => {
  const { dispatch, currentStep, index, currentSequence } = props;
  const conflicts = settingConflicts(currentStep, props.hardwareFlags);
  return <StepWrapper {...props}
    className={"calibrate-step"}
    helpText={ToolTips.CALIBRATE}
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

export const settingConflicts =
  (step: Calibrate | FindHome,
    hardwareFlags: HardwareFlags | undefined,
  ): Record<Xyz, boolean> => {
    const conflicts = { x: false, y: false, z: false };
    if (hardwareFlags) {
      const { axis } = step.args;
      const { findHomeEnabled } = hardwareFlags;
      switch (axis) {
        case "x":
        case "y":
        case "z":
          conflicts[axis] = !findHomeEnabled[axis];
          break;
        case "all":
          conflicts.x = !findHomeEnabled.x;
          conflicts.y = !findHomeEnabled.y;
          conflicts.z = !findHomeEnabled.z;
          break;
      }
    }
    return conflicts;
  };
