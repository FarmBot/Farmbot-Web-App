import * as _ from "lodash";
import * as React from "react";
import { StepParams } from "../interfaces";
import { t } from "i18next";
import { Row, Col, DropDownItem } from "../../ui/index";
import { Execute } from "farmbot/dist";
import { TaggedSequence } from "farmbot";
import { ResourceIndex } from "../../resources/interfaces";
import { editStep } from "../../api/crud";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { SequenceSelectBox } from "../sequence_select_box";
import { TileMoveAbsSelect } from "./tile_move_absolute/select";
import { LocationData } from "./tile_move_absolute/interfaces";

export function ExecuteBlock(p: StepParams) {
  if (p.currentStep.kind === "execute") {
    return <RefactoredExecuteBlock currentStep={p.currentStep}
      currentSequence={p.currentSequence}
      index={p.index}
      dispatch={p.dispatch}
      resources={p.resources} />;
  } else {
    throw new Error("Thats not an execute block!");
  }
}

export interface ExecBlockParams {
  currentStep: Execute;
  currentSequence: TaggedSequence;
  dispatch: Function;
  index: number;
  resources: ResourceIndex;
}
export class RefactoredExecuteBlock extends React.Component<ExecBlockParams, {}> {
  changeSelection = (input: DropDownItem) => {
    const { dispatch, currentSequence, currentStep, index } = this.props;
    dispatch(editStep({
      sequence: currentSequence,
      step: currentStep,
      index: index,
      executor: (step: Execute) => {
        if (_.isNumber(input.value)) {
          step.args.sequence_id = input.value;
        } else {
          throw new Error("Never not a number;");
        }
      }
    }));
  }

  setVariable = (location: LocationData) => {
    this.props.dispatch(editStep({
      sequence: this.props.currentSequence,
      step: this.props.currentStep,
      index: this.props.index,
      executor(step: Execute) {
        switch (location.kind) {
          case "coordinate":
          case "point":
          case "tool":
            step.body = [
              {
                kind: "variable_declaration",
                args: { label: "parent", data_value: location }
              }
            ];
            return;
          case "identifier":
            step.body = [ // This is a rebind: `const parent = parent;`
              {
                kind: "variable_declaration",
                args: {
                  label: "parent",
                  data_value: { kind: "identifier", args: { label: "parent" } }
                }
              }];
            return;
        }
      }
    }));

    console.dir(location);
  };

  getVariable = (): LocationData => {
    const parent = (this.props.currentStep.body || [])[0];
    if (parent) {
      const parentValue = parent.args.data_value;
      switch (parentValue.kind) {
        case "coordinate":
        case "point":
        case "tool":
          return parentValue;
        case "identifier":
        default:
          throw new Error(`How did ${parentValue.kind} get here?`);
      }
    } else {
      return { kind: "coordinate", args: { x: 0, y: 0, z: 0 } };
    }
  }

  render() {
    const props = this.props;
    const { dispatch, currentStep, index, currentSequence, resources } = props;
    const className = "execute-step";
    return <StepWrapper>
      <StepHeader
        className={className}
        helpText={ToolTips.EXECUTE_SEQUENCE}
        currentSequence={currentSequence}
        currentStep={currentStep}
        dispatch={dispatch}
        index={index} />
      <StepContent className={className}>
        <Row>
          <Col xs={12}>
            <label>{t("Sequence")}</label>
            <SequenceSelectBox
              onChange={this.changeSelection}
              resources={this.props.resources}
              sequenceId={this.props.currentStep.args.sequence_id} />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <label>{t("Set value of 'parent' to:")}</label>
            <TileMoveAbsSelect
              resources={resources}
              selectedItem={this.getVariable()}
              onChange={this.setVariable}
              shouldDisplay={() => true} />
            <p>Debug info: {this.getVariable().kind}</p>
          </Col>
        </Row>
      </StepContent>
    </StepWrapper>;
  }
}
