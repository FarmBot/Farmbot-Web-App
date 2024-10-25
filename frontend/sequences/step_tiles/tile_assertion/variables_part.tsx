import React from "react";
import { overwrite } from "../../../api/crud";
import { Assertion, ParameterApplication } from "farmbot/dist/corpus";
import { StepParams } from "../../interfaces";
import { findSequenceById } from "../../../resources/selectors";
import { Row } from "../../../ui";
import { LocalsList } from "../../locals_list/locals_list";
import { addOrEditParamApps } from "../../locals_list/variable_support";
import { AllowedVariableNodes } from "../../locals_list/locals_list_support";
import { defensiveClone } from "../../../util";

export const VariablesPart = (props: StepParams<Assertion>) => {
  let sequenceId: number | undefined;
  const { _then } = props.currentStep.args;
  if (_then.kind == "execute") {
    sequenceId = _then.args.sequence_id;
  }
  const calleeUuid = sequenceId ?
    findSequenceById(props.resources, sequenceId).uuid
    : undefined;
  const calledSequenceVariableData = calleeUuid
    ? props.resources.sequenceMetas[calleeUuid]
    : undefined;
  return calledSequenceVariableData
    ? <Row>
      <LocalsList
        bodyVariables={_then.body}
        variableData={calledSequenceVariableData}
        sequenceUuid={props.currentSequence.uuid}
        resources={props.resources}
        onChange={(variable: ParameterApplication) => {
          _then.body = addOrEditParamApps(_then.body || [], variable);
          const update = defensiveClone(props.currentStep);
          const nextSequence = defensiveClone(props.currentSequence).body;
          update.args._then = _then;
          nextSequence.body = nextSequence.body || [];
          nextSequence.body[props.index] = update;
          props.dispatch(overwrite(props.currentSequence, nextSequence));
        }}
        locationDropdownKey={JSON.stringify(props.currentSequence)}
        allowedVariableNodes={AllowedVariableNodes.identifier} />
    </Row>
    : <div className={"no-variables"} />;
};
