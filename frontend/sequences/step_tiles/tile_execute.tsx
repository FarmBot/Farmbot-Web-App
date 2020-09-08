import React from "react";
import { StepParams } from "../interfaces";
import { Row, Col, DropDownItem } from "../../ui/index";
import { Execute, ParameterApplication } from "farmbot/dist";
import { editStep } from "../../api/crud";
import { ToolTips } from "../../constants";
import { StepWrapper } from "../step_ui";
import { SequenceSelectBox } from "../sequence_select_box";
import { findSequenceById } from "../../resources/selectors_by_id";
import { LocalsList } from "../locals_list/locals_list";
import {
  addOrEditParamApps, variableList,
} from "../locals_list/variable_support";
import { AllowedVariableNodes } from "../locals_list/locals_list_support";
import { isNumber } from "lodash";

/** Replaces the execute step body with a new array of variables. */
const assignVariable = (props: StepParams<Execute>) =>
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

export class TileExecute extends React.Component<StepParams<Execute>> {

  /**
   * Replace `sequence_id` with the new selection and fill the execute step
   * body with parameter applications for unassigned variables.
   */
  changeSelection = (ddi: DropDownItem) => {
    const { dispatch, currentSequence, currentStep, index, resources
    } = this.props;
    dispatch(editStep({
      sequence: currentSequence,
      step: currentStep,
      index: index,
      executor: (step: Execute) => {
        if (isNumber(ddi.value)) {
          step.args.sequence_id = ddi.value;
          const sequenceUuid = findSequenceById(resources, ddi.value).uuid;
          step.body = variableList(resources.sequenceMetas[sequenceUuid]);
        }
      }
    }));
  }

  render() {
    const { dispatch, currentStep, index, currentSequence, resources
    } = this.props;
    const { sequence_id } = currentStep.args;
    const calleeUuid = sequence_id
      ? findSequenceById(resources, sequence_id).uuid
      : undefined;
    const calledSequenceVariableData = calleeUuid
      ? resources.sequenceMetas[calleeUuid]
      : undefined;
    return <StepWrapper
      className={"execute-step"}
      helpText={ToolTips.EXECUTE_SEQUENCE}
      currentSequence={currentSequence}
      currentStep={currentStep}
      dispatch={dispatch}
      index={index}
      resources={resources}>
      <Row>
        <Col>
          <SequenceSelectBox
            onChange={this.changeSelection}
            resources={resources}
            sequenceId={currentStep.args.sequence_id} />
        </Col>
      </Row>
      <Row>
        {!!calledSequenceVariableData &&
          <Col>
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
    </StepWrapper>;
  }
}
