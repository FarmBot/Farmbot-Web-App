import * as _ from "lodash";
import * as React from "react";
import { StepParams } from "../interfaces";
import { t } from "i18next";
import { Row, Col, DropDownItem } from "../../ui/index";
import { Execute, VariableDeclaration } from "farmbot/dist";
import { TaggedSequence } from "farmbot";
import { ResourceIndex } from "../../resources/interfaces";
import { editStep } from "../../api/crud";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { SequenceSelectBox } from "../sequence_select_box";
import { LocationData } from "./tile_move_absolute/interfaces";
import { ShouldDisplay, Feature } from "../../devices/interfaces";
import { ParentSelector } from "./tile_execute/parent_selector";
import { findSequenceById } from "../../resources/selectors_by_id";

export function ExecuteBlock(p: StepParams) {
  if (p.currentStep.kind === "execute") {
    return <RefactoredExecuteBlock currentStep={p.currentStep}
      currentSequence={p.currentSequence}
      index={p.index}
      dispatch={p.dispatch}
      resources={p.resources}
      shouldDisplay={p.shouldDisplay || (() => false)}
      confirmStepDeletion={p.confirmStepDeletion} />;
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
  shouldDisplay: ShouldDisplay;
  confirmStepDeletion: boolean;
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
  };

  render() {
    const {
      dispatch, currentStep, index, currentSequence, resources
    } = this.props;
    const className = "execute-step";
    const selected = getVariable(currentStep.body);
    const { sequence_id } = currentStep.args;
    const calleeUuid = sequence_id ?
      findSequenceById(resources, sequence_id).uuid : "NOT_SET_YET";
    return <StepWrapper>
      <StepHeader
        className={className}
        helpText={ToolTips.EXECUTE_SEQUENCE}
        currentSequence={currentSequence}
        currentStep={currentStep}
        dispatch={dispatch}
        index={index}
        confirmStepDeletion={this.props.confirmStepDeletion} />
      <StepContent className={className}>
        <Row>
          <Col xs={12}>
            <label>{t("Sequence")}</label>
            <SequenceSelectBox
              onChange={this.changeSelection}
              resources={resources}
              sequenceId={currentStep.args.sequence_id} />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            {this.props.shouldDisplay(Feature.variables) && <ParentSelector
              targetUuid={calleeUuid}
              resources={resources}
              selected={selected}
              onChange={this.setVariable} />}
          </Col>
        </Row>
      </StepContent>
    </StepWrapper>;
  }
}

export const getVariable =
  (parent: VariableDeclaration[] | undefined): LocationData => {
    const p = (parent || [])[0];
    if (p) {
      const parentValue = p.args && p.args.data_value;
      switch (parentValue.kind) {
        case "coordinate":
        case "point":
        case "tool":
        case "identifier":
          return parentValue;
        default:
          throw new Error(`How did this get here? ${JSON.stringify(parentValue)}`);
      }
    } else {
      return { kind: "coordinate", args: { x: 0, y: 0, z: 0 } };
    }
  };
