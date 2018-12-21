import * as _ from "lodash";
import * as React from "react";
import { t } from "i18next";
import { Component } from "react";
import { StepParams } from "../interfaces";
import { MoveAbsState } from "../interfaces";
import {
  Tool,
  Coordinate,
  Point,
  Identifier,
  MoveAbsolute,
  TaggedTool,
  TaggedToolSlotPointer,
  ScopeDeclarationBodyItem,
  VariableDeclaration
} from "farmbot";
import { Row, Col } from "../../ui/index";
import {
  isTaggedSequence,
} from "../../resources/tagged_resources";
import {
  findToolById,
  findSlotByToolId,
  findPointerByTypeAndId
} from "../../resources/selectors";
import { defensiveClone, betterMerge } from "../../util";
import { overwrite } from "../../api/crud";
import { Xyz } from "../../devices/interfaces";
import { InputBox } from "./tile_move_absolute/index";
import { ToolTips } from "../../constants";
import {
  StepWrapper,
  StepHeader,
  StepContent,
  StepWarning,
  conflictsString
} from "../step_ui/index";
import { StepInputBox } from "../inputs/step_input_box";
import {
  determineDropdown, determineVector, findVariableByName
} from "../../resources/sequence_meta";
import { LocationForm } from "../locals_list/locals_list";
import { AllowedDeclaration } from "../locals_list/locals_list_support";

interface Args {
  location: Tool | Coordinate | Point | Identifier;
  speed: number;
  offset: Coordinate;
}
type LocationArg = "location" | "offset";

export class TileMoveAbsolute extends Component<StepParams, MoveAbsState> {
  get resources() { return this.props.resources; }
  get step() { return this.props.currentStep; }
  get tool(): TaggedTool | undefined {
    const l = this.args.location;
    if (l && l.kind === "tool" && l.args.tool_id) {
      return findToolById(this.resources, l.args.tool_id);
    }
  }
  get tool_id() { return this.tool && this.tool.body.id; }
  get slot(): TaggedToolSlotPointer | undefined {
    return this.tool_id ?
      findSlotByToolId(this.resources, this.tool_id) : undefined;
  }
  get args(): MoveAbsolute["args"] { return (this.step as MoveAbsolute).args; }

  getOffsetValue = (val: Xyz) => {
    return (this.args.offset.args[val] || 0).toString();
  }

  /** Merge step args update into step args. */
  updateArgs = (update: Partial<Args>) => {
    const copy = defensiveClone(this.props.currentSequence).body;
    const step = (copy.body || [])[this.props.index] as MoveAbsolute;
    delete step.args.location.args;
    step.args = betterMerge(step.args, update);
    this.props.dispatch(overwrite(this.props.currentSequence, copy));
  }

  /** Get axis value for settingConflicts. */
  getAxisValue = (axis: Xyz): string => {
    let number: number | undefined;
    const l = this.args.location;
    switch (l.kind) {
      case "coordinate":
        number = l.args[axis];
        break;
      case "tool":
        number = (this.slot) ? this.slot.body[axis] : undefined;
        break;
      case "point":
        const { pointer_id } = l.args;
        number = findPointerByTypeAndId(this.resources, "Point", pointer_id)
          .body[axis];
        break;
      case "identifier":
        const { resources, currentSequence } = this.props;
        const v =
          findVariableByName(resources, currentSequence.uuid, l.args.label);
        if (v && v.vector) {
          number = v.vector[axis];
          break;
        }
    }
    return (number || 0).toString();
  }

  /** Update offset value. */
  updateInputValue = (axis: Xyz, place: LocationArg) =>
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      const num = parseFloat(e.currentTarget.value);
      const update = { [place]: { args: { [axis]: num } } };
      this.updateArgs(_.merge({}, this.args, update));
    }

  /** Determine if location conflicts with bot settings. */
  get settingConflicts(): Record<Xyz, boolean> {
    const conflicts = { x: false, y: false, z: false };
    if (this.props.hardwareFlags) {
      const {
        stopAtHome, stopAtMax, negativeOnly, axisLength
      } = this.props.hardwareFlags;
      const axes: Xyz[] = ["x", "y", "z"];
      axes.map((axis: Xyz) => {
        const coord = parseFloat(this.getAxisValue(axis));
        const offset = parseFloat(this.getOffsetValue(axis));
        const sum = coord + offset;
        if (stopAtHome[axis]) {
          conflicts[axis] = negativeOnly[axis] ? sum > 0 : sum < 0;
        }
        if (stopAtMax[axis] && axisLength[axis] !== 0) {
          conflicts[axis] = conflicts[axis] || (negativeOnly[axis]
            ? sum < -axisLength[axis]
            : sum > axisLength[axis]);
        }
      });
    }
    return conflicts;
  }

  get settingConflictWarning() {
    return t("Movement out of bounds for: ")
      + conflictsString(this.settingConflicts);
  }

  /** Handle changes to step.args.location. */
  updateLocation = (declaration: VariableDeclaration) => {
    this.updateArgs({ location: declaration.args.data_value });
  }

  /** Prepare step.args.location data for LocationForm. */
  get celeryNode(): ScopeDeclarationBodyItem {
    const { location } = this.args;
    return {
      kind: "variable_declaration",
      args: {
        label: location.kind === "identifier" ? location.args.label : "",
        data_value: location
      }
    };
  }

  LocationForm = () =>
    <LocationForm
      variable={{
        celeryNode: this.celeryNode,
        dropdown: determineDropdown(this.celeryNode, this.resources),
        vector: determineVector(
          this.celeryNode, this.resources, this.props.currentSequence.uuid),
      }}
      sequenceUuid={this.props.currentSequence.uuid}
      resources={this.resources}
      onChange={this.updateLocation}
      shouldDisplay={this.props.shouldDisplay || (() => false)}
      hideVariableLabel={true}
      locationDropdownKey={JSON.stringify(this.props.currentSequence)}
      allowedDeclarations={AllowedDeclaration.identifier}
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
          <InputBox
            onCommit={this.updateInputValue(axis, "offset")}
            name={`offset-${axis}`}
            value={this.getOffsetValue(axis)}>
            {t("{{axis}}-Offset", { axis })}
          </InputBox>
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
        {_.some(this.settingConflicts) &&
          <StepWarning
            warning={this.settingConflictWarning}
            conflicts={this.settingConflicts} />}
      </StepHeader>
      <StepContent className={className}>
        <this.LocationForm />
        <this.OffsetForm />
      </StepContent>
    </StepWrapper>;
  }
}
