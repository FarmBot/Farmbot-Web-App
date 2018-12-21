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
import { ShouldDisplay } from "../../devices/interfaces";
import { findSequenceById } from "../../resources/selectors_by_id";
import { LocalsList } from "../locals_list/locals_list";
import {
  addOrEditVarDeclaration, declarationList
} from "../locals_list/declaration_support";
import { AllowedDeclaration } from "../locals_list/locals_list_support";

/** Replaces the execute step body with a new array of declarations. */
const assignVariable = (props: ExecBlockParams) =>
  (declarations: VariableDeclaration[]) =>
    (variable: VariableDeclaration) => {
      const { dispatch, currentSequence, currentStep, index } = props;

      dispatch(editStep({
        step: currentStep,
        sequence: currentSequence,
        index: index,
        executor(step) {
          step.body = addOrEditVarDeclaration(declarations)(variable);
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
   * body with variable declarations for unassigned variables.
   */
  changeSelection = (input: DropDownItem) => {
    const { dispatch, currentSequence, currentStep, index, resources
    } = this.props;
    dispatch(editStep({
      sequence: currentSequence,
      step: currentStep,
      index: index,
      executor: (step: Execute) => {
        if (_.isNumber(input.value)) {
          step.args.sequence_id = input.value;
          const sequenceUuid = findSequenceById(resources, input.value).uuid;
          step.body = declarationList(resources.sequenceMetas[sequenceUuid]);
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
          <Col xs={12}>
            <label>{t("Sequence")}</label>
            <SequenceSelectBox
              onChange={this.changeSelection}
              resources={resources}
              sequenceId={currentStep.args.sequence_id} />
          </Col>
        </Row>
        <Row>
          {!!calledSequenceVariableData &&
            <Col xs={12}>
              <LocalsList
                declarations={currentStep.body}
                variableData={calledSequenceVariableData}
                sequenceUuid={currentSequence.uuid}
                resources={resources}
                onChange={assignVariable(this.props)(currentStep.body || [])}
                locationDropdownKey={JSON.stringify(currentSequence)}
                allowedDeclarations={AllowedDeclaration.identifier}
                shouldDisplay={this.props.shouldDisplay} />
            </Col>}
        </Row>
      </StepContent>
    </StepWrapper>;
  }
}
