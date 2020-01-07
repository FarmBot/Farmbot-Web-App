import * as React from "react";
import { FindHome, Xyz, TaggedSequence } from "farmbot";
import { StepParams, HardwareFlags } from "../interfaces";
import { ResourceIndex } from "../../resources/interfaces";
import { ToolTips, Content } from "../../constants";
import {
  StepWrapper, StepHeader, StepContent, StepWarning, conflictsString
} from "../step_ui/index";
import { some } from "lodash";
import { AxisStepRadio } from "../step_ui/step_radio";
import { t } from "../../i18next_wrapper";

export function TileFindHome(props: StepParams) {
  if (props.currentStep.kind === "find_home") {
    return <InnerFindHome
      currentStep={props.currentStep}
      currentSequence={props.currentSequence}
      dispatch={props.dispatch}
      index={props.index}
      resources={props.resources}
      hardwareFlags={props.hardwareFlags}
      confirmStepDeletion={props.confirmStepDeletion} />;
  } else {
    throw new Error("TileFindHome expects find_home");
  }
}
export interface FindHomeParams {
  currentStep: FindHome;
  currentSequence: TaggedSequence;
  dispatch: Function;
  index: number;
  resources: ResourceIndex;
  hardwareFlags: HardwareFlags | undefined;
  confirmStepDeletion: boolean;
}

class InnerFindHome extends React.Component<FindHomeParams, {}> {
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
    const { dispatch, index, currentStep, currentSequence } = this.props;

    const className = "find-home-step";
    return <StepWrapper>
      <StepHeader
        className={className}
        helpText={ToolTips.FIND_HOME}
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
          label={t("Find")} />
      </StepContent>
    </StepWrapper>;
  }
}
