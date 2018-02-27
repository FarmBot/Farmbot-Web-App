import * as React from "react";
import { t } from "i18next";
import { FindHome, ALLOWED_AXIS, Xyz } from "farmbot";
import { StepParams, HardwareFlags } from "../interfaces";
import { TaggedSequence } from "../../resources/tagged_resources";
import { ResourceIndex } from "../../resources/interfaces";
import { overwrite } from "../../api/crud";
import { defensiveClone } from "../../util";
import { ToolTips, Content } from "../../constants";
import {
  StepWrapper, StepHeader, StepContent, StepWarning, conflictsString
} from "../step_ui/index";
import { Row, Col } from "../../ui/index";
import { some } from "lodash";

export function TileFindHome(props: StepParams) {
  if (props.currentStep.kind === "find_home") {
    return <InnerFindHome
      currentStep={props.currentStep}
      currentSequence={props.currentSequence}
      dispatch={props.dispatch}
      index={props.index}
      resources={props.resources}
      hardwareFlags={props.hardwareFlags} />;
  } else {
    throw new Error("TileFindHome expects find_home");
  }
}
interface FindHomeParams {
  currentStep: FindHome;
  currentSequence: TaggedSequence;
  dispatch: Function;
  index: number;
  resources: ResourceIndex;
  hardwareFlags: HardwareFlags | undefined;
}

const AXIS_CHOICES: ALLOWED_AXIS[] = ["x", "y", "z", "all"];

class InnerFindHome extends React.Component<FindHomeParams, {}> {

  isSelected = (axis: ALLOWED_AXIS) => {
    return this.props.currentStep.args.axis === axis;
  };

  handleUpdate = (axis: ALLOWED_AXIS) => {
    const update = defensiveClone(this.props.currentStep);
    const nextSequence = defensiveClone(this.props.currentSequence).body;
    update.args.axis = axis;
    (nextSequence.body || [])[this.props.index] = update;
    this.props.dispatch(overwrite(this.props.currentSequence, nextSequence));
  }

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
        index={index}>
        {some(this.settingConflicts) &&
          <StepWarning
            warning={this.settingConflictWarning}
            conflicts={this.settingConflicts} />}
      </StepHeader>
      <StepContent className={className}>
        <Row>
          <Col xs={12}>
            <div className="bottom-content">
              <div className="channel-fields">
                <form>
                  {AXIS_CHOICES.map((axis, i) => {
                    return <div key={i} style={{ display: "inline" }}>
                      <label>
                        <input type="radio"
                          value={axis}
                          onChange={(e) => {
                            const nextVal =
                              e.currentTarget.value as typeof axis;
                            this.handleUpdate(nextVal);
                          }}
                          checked={this.isSelected(axis)} />
                        {" "} {t("Find ")} {axis}
                      </label>
                    </div>;
                  })}
                </form>
              </div>
            </div>
          </Col>
        </Row>
      </StepContent>
    </StepWrapper>;
  }
}
