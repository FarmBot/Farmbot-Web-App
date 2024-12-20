import React from "react";
import { StepParams, MoveAbsState } from "../interfaces";
import { MoveAbsolute, Vector3, ParameterApplication, Xyz } from "farmbot";
import { Row, BlurableInput } from "../../ui";
import { defensiveClone, betterMerge } from "../../util";
import { overwrite } from "../../api/crud";
import { ToolTips } from "../../constants";
import { StepWrapper } from "../step_ui";
import { StepInputBox } from "../inputs/step_input_box";
import {
  determineDropdown, determineVector, Vector3Plus,
} from "../../resources/sequence_meta";
import { VariableForm } from "../locals_list/variable_form";
import {
  VariableNode, AllowedVariableNodes, VariableType,
} from "../locals_list/locals_list_support";
import { merge } from "lodash";
import {
  MoveAbsoluteWarning, getPositionSum,
} from "./tile_move_absolute_conflict_check";
import { t } from "../../i18next_wrapper";
import { Collapse } from "@blueprintjs/core";
import { ExpandableHeader } from "../../ui/expandable_header";
import { isDesktop } from "../../screen_size";

export class TileMoveAbsolute
  extends React.Component<StepParams<MoveAbsolute>, MoveAbsState> {
  state: MoveAbsState = {
    more: !!this.props.expandStepOptions || this.hasOffset || this.hasSpeed
  };
  get step() { return this.props.currentStep; }
  get args() { return this.step.args; }
  get hasOffset(): boolean {
    const { x, y, z } = this.args.offset.args;
    return !!(x || y || z);
  }
  get hasSpeed(): boolean { return this.args.speed !== 100; }

  /** Merge step args update into step args. */
  updateArgs = (update: Partial<MoveAbsolute["args"]>) => {
    const copy = defensiveClone(this.props.currentSequence).body;
    const step = (copy.body || [])[this.props.index];
    if (step?.kind == "move_absolute") {
      step.args.location.args = {} as MoveAbsolute["args"]["location"]["args"];
      step.args = betterMerge(step.args, update);
      this.props.dispatch(overwrite(this.props.currentSequence, copy));
    }
  };

  /** Update offset value. */
  updateInputValue = (axis: Xyz, place: "location" | "offset") =>
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      const num = parseFloat(e.currentTarget.value);
      const update = { [place]: { args: { [axis]: num } } };
      this.updateArgs(merge({}, this.args, update));
    };

  /** Handle changes to step.args.location. */
  updateLocation = (variable: ParameterApplication) => {
    const location = variable.args.data_value;
    if (location.kind == "coordinate"
      || location.kind == "point"
      || location.kind == "tool"
      || location.kind == "identifier") {
      return this.updateArgs({ location });
    }
  };

  /** Prepare step.args.location data for VariableForm. */
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

  get vector(): Vector3 | Vector3Plus | undefined {
    const sequenceUuid = this.props.currentSequence.uuid;
    return determineVector(this.celeryNode, this.props.resources, sequenceUuid);
  }

  get gantryMounted() {
    return this.vector && ("gantry_mounted" in this.vector)
      && this.vector.gantry_mounted;
  }

  LocationForm = () =>
    <VariableForm
      variable={{
        celeryNode: this.celeryNode,
        dropdown: determineDropdown(this.celeryNode, this.props.resources,
          this.props.currentSequence.uuid),
        vector: this.vector,
      }}
      sequenceUuid={this.props.currentSequence.uuid}
      resources={this.props.resources}
      onChange={(x) => x &&
        x.kind == "parameter_application" &&
        this.updateLocation(x)}
      hideWrapper={true}
      hideGroups={true}
      locationDropdownKey={JSON.stringify(this.props.currentSequence)}
      allowedVariableNodes={AllowedVariableNodes.identifier}
      variableType={VariableType.Location} />;

  SpeedInput = () =>
    <div>
      <label>
        {t("Speed (%)")}
      </label>
      <StepInputBox
        field={"speed"}
        step={this.step}
        index={this.props.index}
        dispatch={this.props.dispatch}
        sequence={this.props.currentSequence} />
    </div>;

  OffsetInput = (axis: Xyz) =>
    <div key={axis}>
      <label>
        {t("{{axis}}-Offset", { axis })}
      </label>
      <BlurableInput type="number"
        disabled={axis == "x" && this.gantryMounted}
        onCommit={this.updateInputValue(axis, "offset")}
        name={`offset-${axis}`}
        value={(this.args.offset.args[axis] || 0).toString()} />
    </div>;

  OptionsForm = () =>
    <Row className="grid-4-col">
      {["x", "y", "z"].map(this.OffsetInput)}
      <this.SpeedInput />
    </Row>;

  render() {
    return <StepWrapper {...this.props}
      className={"move-absolute-step"}
      helpText={ToolTips.MOVE_ABSOLUTE}
      warning={<MoveAbsoluteWarning
        coordinate={getPositionSum(this.vector, this.args.offset.args)}
        hardwareFlags={this.props.hardwareFlags} />}>
      <Row>
        <div className={"move-absolute-form"}>
          <div className="input-line">
            <this.LocationForm />
          </div>
          <div className="more-options">
            <ExpandableHeader
              expanded={this.state.more}
              title={isDesktop() ? t("Options") : ""}
              onClick={() => this.setState({ more: !this.state.more })} />
          </div>
        </div>
      </Row>
      <Collapse isOpen={this.state.more}>
        <this.OptionsForm />
      </Collapse>
    </StepWrapper>;
  }
}
