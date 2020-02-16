import * as React from "react";
import { StepParams, HardwareFlags } from "../interfaces";
import { ToolTips, Content } from "../../constants";
import {
  StepWrapper, StepHeader, StepContent, conflictsString, StepWarning
} from "../step_ui/index";
import { AxisStepRadio } from "../step_ui/step_radio";
import { t } from "../../i18next_wrapper";
import { Xyz, Calibrate, TaggedSequence } from "farmbot";
import { some } from "lodash";
import { ResourceIndex } from "../../resources/interfaces";

export function TileCalibrate(props: StepParams) {
  if (props.currentStep.kind === "calibrate") {
    return <InnerTileCalibrate
      currentStep={props.currentStep}
      currentSequence={props.currentSequence}
      dispatch={props.dispatch}
      index={props.index}
      resources={props.resources}
      hardwareFlags={props.hardwareFlags}
      confirmStepDeletion={props.confirmStepDeletion} />;
  } else {
    throw new Error("TileCalibrate expects calibrate");
  }
}

export interface CalibrateParams {
  currentStep: Calibrate;
  currentSequence: TaggedSequence;
  dispatch: Function;
  index: number;
  resources: ResourceIndex;
  hardwareFlags: HardwareFlags | undefined;
  confirmStepDeletion: boolean;
}

class InnerTileCalibrate extends React.Component<CalibrateParams, {}> {
  get settingConflicts(): Record<Xyz, boolean> {
    const conflicts = { x: false, y: false, z: false };
    if (this.props.hardwareFlags) {
      const { axis } = this.props.currentStep.args;
      const { findHomeEnabled } = this.props.hardwareFlags;
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
  }

  get settingConflictWarning() {
    return Content.END_DETECTION_DISABLED
      + conflictsString(this.settingConflicts);
  }

  render() {

    const { dispatch, currentStep, index, currentSequence } = this.props;
    const className = "calibrate-step";
    return <StepWrapper>
      <StepHeader
        className={className}
        helpText={ToolTips.CALIBRATE}
        currentSequence={currentSequence}
        currentStep={currentStep}
        dispatch={dispatch}
        index={index}
        confirmStepDeletion={this.props.confirmStepDeletion}>
        {some(this.settingConflicts) &&
          <StepWarning
            warning={this.settingConflictWarning}
            conflicts={this.settingConflicts} />}
      </StepHeader>
      <StepContent className={className}>
        <AxisStepRadio
          currentSequence={currentSequence}
          currentStep={currentStep}
          dispatch={dispatch}
          index={index}
          label={t("Calibrate")} />
      </StepContent>
    </StepWrapper>;
  }
}
