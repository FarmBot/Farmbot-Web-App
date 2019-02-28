import * as React from "react";
import { t } from "i18next";
import { StepParams } from "../interfaces";
import { MoveAbsState } from "../interfaces";
import { MoveAbsolute, Vector3, ParameterApplication } from "farmbot";
import { Row, Col, BlurableInput } from "../../ui";
import { isTaggedSequence } from "../../resources/tagged_resources";
import { defensiveClone, betterMerge } from "../../util";
import { overwrite } from "../../api/crud";
import { Xyz } from "../../devices/interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui";
import { StepInputBox } from "../inputs/step_input_box";
import {
  determineDropdown, determineVector
} from "../../resources/sequence_meta";
import { LocationForm } from "../locals_list/location_form";
import {
  VariableNode, AllowedVariableNodes
} from "../locals_list/locals_list_support";
import { merge } from "lodash";
import { MoveAbsoluteWarning } from "./tile_move_absolute_conflict_check";

export class TileMoveAbsolute extends React.Component<StepParams, MoveAbsState> {
  get step() { return this.props.currentStep as MoveAbsolute; }
  get args() { return this.step.args; }

  /** Merge step args update into step args. */
  updateArgs = (update: Partial<MoveAbsolute["args"]>) => {
    const copy = defensiveClone(this.props.currentSequence).body;
    const step = (copy.body || [])[this.props.index] as MoveAbsolute;
    delete step.args.location.args;
    step.args = betterMerge(step.args, update);
    this.props.dispatch(overwrite(this.props.currentSequence, copy));
  }

  /** Update offset value. */
  updateInputValue = (axis: Xyz, place: "location" | "offset") =>
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      const num = parseFloat(e.currentTarget.value);
      const update = { [place]: { args: { [axis]: num } } };
      this.updateArgs(merge({}, this.args, update));
    }

  /** Handle changes to step.args.location. */
  updateLocation = (variable: ParameterApplication) => {
    const location = variable.args.data_value;
    if (location.kind === "every_point") {
      throw new Error("Can't put `every_point` into `move_abs");
    } else {
      this.updateArgs({ location });
    }
  }

  /** Prepare step.args.location data for LocationForm. */
  get celeryNode(): VariableNode {
    const { location } = this.args;
    return {
      kind: "parameter_application",
      args: {
        label: location.kind === "identifier" ? location.args.label : "",
        data_value: location
      }
    };
  }

  get vector(): Vector3 | undefined {
    const sequenceUuid = this.props.currentSequence.uuid;
    return determineVector(this.celeryNode, this.props.resources, sequenceUuid);
  }

  LocationForm = () =>
    <LocationForm
      variable={{
        celeryNode: this.celeryNode,
        dropdown: determineDropdown(this.celeryNode, this.props.resources),
        vector: this.vector,
      }}
      sequenceUuid={this.props.currentSequence.uuid}
      resources={this.props.resources}
      onChange={this.updateLocation}
      shouldDisplay={this.props.shouldDisplay || (() => false)}
      hideVariableLabel={true}
      locationDropdownKey={JSON.stringify(this.props.currentSequence)}
      allowedVariableNodes={AllowedVariableNodes.identifier}
      disallowGroups={true}
      width={3} />

  SpeedForm = () =>
    <Col xs={3}>
      <label>
        {t("Speed (%)")}
      </label>
      <StepInputBox
        field={"speed"}
        step={this.step}
        index={this.props.index}
        dispatch={this.props.dispatch}
        sequence={this.props.currentSequence} />
    </Col>

  OffsetForm = () =>
    <Row>
      {["x", "y", "z"].map((axis: Xyz) =>
        <Col xs={3} key={axis}>
          <label>
            {t("{{axis}}-Offset", { axis })}
          </label>
          <BlurableInput type="number"
            onCommit={this.updateInputValue(axis, "offset")}
            name={`offset-${axis}`}
            value={(this.args.offset.args[axis] || 0).toString()} />
        </Col>)}
      <this.SpeedForm />
    </Row>

  render() {
    const { currentStep, dispatch, index, currentSequence } = this.props;
    if (currentSequence && !isTaggedSequence(currentSequence)) {
      throw new Error("WHOOPS!");
    }

    const className = "move-absolute-step";
    return <StepWrapper>
      <StepHeader
        className={className}
        helpText={ToolTips.MOVE_ABSOLUTE}
        currentSequence={currentSequence}
        currentStep={currentStep}
        dispatch={dispatch}
        index={index}
        confirmStepDeletion={this.props.confirmStepDeletion}>
        <MoveAbsoluteWarning
          vector={this.vector}
          offset={this.args.offset.args}
          hardwareFlags={this.props.hardwareFlags} />
      </StepHeader>
      <StepContent className={className}>
        <this.LocationForm />
        <this.OffsetForm />
      </StepContent>
    </StepWrapper>;
  }
}
