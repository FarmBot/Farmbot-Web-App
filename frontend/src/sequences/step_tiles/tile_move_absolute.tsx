import * as React from "react";
import { Component } from "react";
import { StepParams } from "../interfaces";
import { splice, remove } from "./index";
import { MoveAbsState } from "../interfaces";
import {
  Tool,
  Coordinate,
  LegalSequenceKind,
  Point
} from "farmbot";
import {
  Row,
  Col,
} from "../../ui";
import { StepInputBox } from "../inputs/step_input_box";
import { t } from "i18next";
import { StepTitleBar } from "./step_title_bar";
import {
  isTaggedSequence,
  TaggedTool,
  TaggedToolSlotPointer
} from "../../resources/tagged_resources";
import {
  findToolById,
  findSlotByToolId,
  findPointerByTypeAndId
} from "../../resources/selectors";
import { defensiveClone, betterMerge } from "../../util";
import { overwrite } from "../../api/crud";
import { Xyz } from "../../devices/interfaces";
import { TileMoveAbsSelect } from "./tile_move_absolute/select";
import { InputBox } from "./tile_move_absolute/input_box";
import { ToolTips } from "../../constants";

interface Args {
  location: Tool | Coordinate | Point;
  speed: number;
  offset: Coordinate;
}
type LocationArg = "location" | "offset";

export class TileMoveAbsolute extends Component<StepParams, MoveAbsState> {
  get resources() { return this.props.resources; }
  get step() { return this.props.currentStep; }
  get tool(): TaggedTool | undefined {
    let l = this.args.location;
    if (l && l.kind === "tool" && l.args.tool_id) {
      return findToolById(this.resources, l.args.tool_id);
    }
  }
  get tool_id() { return this.tool && this.tool.body.id; }
  get slot(): TaggedToolSlotPointer | undefined {
    return (this.tool_id) ?
      findSlotByToolId(this.resources, this.tool_id) : undefined;
  }
  get args() {
    // Incase we rename it later:
    const MOVE_ABSOLUTE: LegalSequenceKind = "move_absolute";
    if (this.step.kind === MOVE_ABSOLUTE) {
      return this.step.args;
    } else {
      throw new Error("Impossible celery node detected.");
    }
  }
  get location(): Tool | Coordinate {
    if (this.args.location.kind !== "point") {
      return this.args.location;
    } else {
      throw new Error("A `point` node snuck in. Still WIP");
    }
  }

  get xyzDisabled(): boolean {
    let isPoint = this.args.location.kind === "point";
    let isTool = this.args.location.kind === "tool";
    return !!(isPoint || isTool);
  }

  getOffsetValue = (val: Xyz) => {
    return (this.args.offset.args[val] || 0).toString();
  }

  updateArgs = (update: Partial<Args>) => {
    let copy = defensiveClone(this.props.currentSequence).body;
    let step = (copy.body || [])[this.props.index];
    if (step && step.kind === "move_absolute") {
      step.args = betterMerge(step.args, update);
      this.props.dispatch(overwrite(this.props.currentSequence, copy));
    } else {
      throw new Error("Impossible condition.");
    }
  }

  getAxisValue = (axis: Xyz): string => {
    let number: number | undefined;
    let l = this.args.location;
    switch (l.kind) {
      case "coordinate":
        number = l.args[axis];
        break;
      case "tool":
        number = (this.slot) ? this.slot.body[axis] : undefined;
        break;
      case "point":
        let { pointer_id, pointer_type } = l.args;
        number = findPointerByTypeAndId(this.resources,
          pointer_type,
          pointer_id).body[axis];
    }
    return (number || 0).toString();
  }

  updateInputValue = (axis: Xyz, place: LocationArg) =>
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      let num = parseInt(e.currentTarget.value, 10);
      let update = { [place]: { args: { [axis]: num } } };
      this.updateArgs(_.merge({}, this.args, update));
    }

  render() {
    let { currentStep, dispatch, index, currentSequence } = this.props;
    if (currentSequence && !isTaggedSequence(currentSequence)) {
      throw new Error("WHOOPS!");
    }

    return <div className="step-wrapper">
      <Row>
        <Col sm={12}>
          <div className="step-header move-absolute-step">
            <StepTitleBar index={index} dispatch={dispatch} step={currentStep} />
            <i className="fa fa-arrows-v step-control" />
            <i className="fa fa-clone step-control"
              onClick={() => dispatch(splice({
                step: currentStep,
                index,
                sequence: currentSequence
              }))} />
            <i className="fa fa-trash step-control"
              onClick={() => remove({ dispatch, index, sequence: currentSequence })} />
            <div className="help">
              <i className="fa fa-question-circle help-icon" />
              <div className="help-text">
                {t(ToolTips.MOVE_ABSOLUTE)}
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col sm={12}>
          <div className="step-content move-absolute-step">
            <Row>
              <Col md={12}>
                <label>{t("Import coordinates from")}</label>
                <TileMoveAbsSelect
                  resources={this.resources}
                  selectedItem={this.args.location}
                  onChange={(x) => this.updateArgs({ location: x })} />
              </Col>
              <Col xs={3}>
                <InputBox
                  onCommit={this.updateInputValue("x", "location")}
                  disabled={this.xyzDisabled}
                  name="location-x"
                  value={this.getAxisValue("x")}>
                  {t("X (mm)")}
                </InputBox>
              </Col>
              <Col xs={3}>
                <InputBox
                  onCommit={this.updateInputValue("y", "location")}
                  disabled={this.xyzDisabled}
                  name="location-y"
                  value={this.getAxisValue("y")}>
                  {t("Y (mm)")}
                </InputBox>
              </Col>
              <Col xs={3}>
                <InputBox
                  onCommit={this.updateInputValue("z", "location")}
                  name="location-z"
                  disabled={this.xyzDisabled}
                  value={this.getAxisValue("z")}>
                  {t("Z (mm)")}
                </InputBox>
              </Col>
            </Row>
            {/*<Col xs={3}>
                <label>
                  {t("Speed")}
                </label>
                <StepInputBox
                  field={"speed"}
                  step={this.step}
                  index={index}
                  dispatch={this.props.dispatch}
                  sequence={this.props.currentSequence} />
              </Col>*/}
            <Row>
              <Col xs={3}>
                <InputBox
                  onCommit={this.updateInputValue("x", "offset")}
                  name="offset-x"
                  value={this.getOffsetValue("x")}>
                  {t("X-Offset")}
                </InputBox>
              </Col>
              <Col xs={3}>
                <InputBox
                  onCommit={this.updateInputValue("y", "offset")}
                  name="offset-y"
                  value={this.getOffsetValue("y")}>
                  {t("Y-Offset")}
                </InputBox>
              </Col>
              <Col xs={3}>
                <InputBox
                  onCommit={this.updateInputValue("z", "offset")}
                  name="offset-z"
                  value={this.getOffsetValue("z")}>
                  {t("Z-Offset")}
                </InputBox>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </div>;
  }
}
