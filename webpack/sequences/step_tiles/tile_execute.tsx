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
import { ShouldDisplay } from "../../devices/interfaces";
import { ParentSelector } from "./tile_execute/parent_selector";
import { findSequenceById } from "../../resources/selectors_by_id";
import {
  extractParent,
  convertDropdownToLocation,
  MoveAbsDropDownContents
} from "../../resources/sequence_meta";
const assignVariable =
  (props: ExecBlockParams) => (contents: MoveAbsDropDownContents) => {
    const { dispatch, currentSequence, currentStep, index } = props;
    const data_value = convertDropdownToLocation(contents);
    dispatch(editStep({
      step: currentStep,
      sequence: currentSequence,
      index: index,
      executor(step) {
        if (step.kind === "execute") {
          step.body = [{
            kind: "variable_declaration",
            args: { label: "parent", data_value }
          }];
        }
      }
    }));
  };
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

  render() {
    const {
      dispatch, currentStep, index, currentSequence, resources
    } = this.props;
    const className = "execute-step";
    const { sequence_id } = currentStep.args;
    const calleeUuid = sequence_id ?
      findSequenceById(resources, sequence_id).uuid : undefined;
    const selected = calleeUuid ?
      extractParent(resources, calleeUuid) : undefined;
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
          {selected &&
            selected.celeryNode.kind == "parameter_declaration" &&
            <Col xs={12}>
              <ParentSelector
                targetUuid={calleeUuid || "NOT_SET_YET"}
                currentUuid={currentSequence.uuid}
                resources={resources}
                selected={selected.variableValue}
                onChange={assignVariable(this.props)} />
            </Col>}
        </Row>
      </StepContent>
    </StepWrapper>;
  }
}
