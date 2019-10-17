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

const CLASS_NAME = "execute-step";

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
    const { sequence_id } = this.props.currentStep.args;
    let TheStuff: JSX.Element | undefined;
    if (sequence_id) {
      const x = findSequenceById(this.props.resources, sequence_id).uuid;
      const variableData =
        this.props.resources.sequenceMetas[x];
      TheStuff = <Col className="execute-sequence">
        <LocalsList
          bodyVariables={this.props.currentStep.body}
          variableData={variableData}
          sequenceUuid={this.props.currentSequence.uuid}
          resources={this.props.resources}
          onChange={assignVariable(this.props)(this.props.currentStep.body || [])}
          locationDropdownKey={JSON.stringify(this.props.currentSequence)}
          allowedVariableNodes={AllowedVariableNodes.identifier}
          shouldDisplay={this.props.shouldDisplay}
          hideGroups={true} />
      </Col>;
    }

    return <StepWrapper>
      <StepHeader
        className={CLASS_NAME}
        helpText={ToolTips.EXECUTE_SEQUENCE}
        currentSequence={this.props.currentSequence}
        currentStep={this.props.currentStep}
        dispatch={this.props.dispatch}
        index={this.props.index}
        confirmStepDeletion={this.props.confirmStepDeletion} />
      <StepContent className={CLASS_NAME}>
        <Row>
          <Col className="execute-sequence">
            <SequenceSelectBox
              onChange={this.changeSelection}
              resources={this.props.resources}
              sequenceId={this.props.currentStep.args.sequence_id} />
          </Col>
        </Row>
        <Row>
          {TheStuff}
        </Row>
      </StepContent>
    </StepWrapper>;
  }
}
