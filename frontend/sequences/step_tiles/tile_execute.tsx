import * as React from "react";
import { StepParams } from "../interfaces";

import { Row, Col, DropDownItem } from "../../ui/index";
import { Execute, ParameterApplication } from "farmbot/dist";
import { TaggedSequence } from "farmbot";
import { ResourceIndex } from "../../resources/interfaces";
import { editStep } from "../../api/crud";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { SequenceSelectBox } from "../sequence_select_box";
import { ShouldDisplay } from "../../devices/interfaces";
import { findSequenceById } from "../../resources/selectors_by_id";
import { LocalsList } from "../locals_list/locals_list";
import {
  addOrEditParamApps, variableList
} from "../locals_list/variable_support";
import { AllowedVariableNodes } from "../locals_list/locals_list_support";
import { isNumber } from "lodash";

/** Replaces the execute step body with a new array of variables. */
const assignVariable = (props: ExecBlockParams) =>
  (variables: ParameterApplication[]) =>
    (variable: ParameterApplication) => {
      const { dispatch, currentSequence, currentStep, index } = props;

      dispatch(editStep({
        step: currentStep,
        sequence: currentSequence,
        index: index,
        executor(step) {
          step.body = addOrEditParamApps(variables, variable);
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
export class RefactoredExecuteBlock
  extends React.Component<ExecBlockParams, {}> {

  /**
   * Replace `sequence_id` with the new selection and fill the execute step
   * body with parameter applications for unassigned variables.
   */
  changeSelection = (input: DropDownItem) => {
    const { dispatch, currentSequence, currentStep, index, resources
    } = this.props;
    dispatch(editStep({
      sequence: currentSequence,
      step: currentStep,
      index: index,
      executor: (step: Execute) => {
        if (isNumber(input.value)) {
          step.args.sequence_id = input.value;
          const sequenceUuid = findSequenceById(resources, input.value).uuid;
          step.body = variableList(resources.sequenceMetas[sequenceUuid]);
        }
      }
    }));
  }

  render() {
    const { dispatch, currentStep, index, currentSequence, resources
    } = this.props;
    const className = "execute-step";
    const { sequence_id } = currentStep.args;
    const calleeUuid = sequence_id ?
      findSequenceById(resources, sequence_id).uuid : undefined;
    const calledSequenceVariableData = calleeUuid ?
      resources.sequenceMetas[calleeUuid] : undefined;
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
          <Col xs={6}>
            <SequenceSelectBox
              onChange={this.changeSelection}
              resources={resources}
              sequenceId={currentStep.args.sequence_id} />
          </Col>
        </Row>
        <Row>
          {!!calledSequenceVariableData &&
            <Col xs={6}>
              <LocalsList
                bodyVariables={currentStep.body}
                variableData={calledSequenceVariableData}
                sequenceUuid={currentSequence.uuid}
                resources={resources}
                onChange={assignVariable(this.props)(currentStep.body || [])}
                locationDropdownKey={JSON.stringify(currentSequence)}
                allowedVariableNodes={AllowedVariableNodes.identifier}
                shouldDisplay={this.props.shouldDisplay} />
            </Col>}
        </Row>
      </StepContent>
    </StepWrapper>;
  }
}
