import * as React from "react";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { editStep } from "../../api/crud";
import { SequenceBodyItem, LegalArgString } from "farmbot";
import { Feature } from "../../devices/interfaces";
import { trim } from "../../util";

const convertOldMarkAs = (oldStep: SequenceBodyItem) =>
  (step: SequenceBodyItem) => {
    const stepArgs = oldStep.args as Record<LegalArgString, string>;
    step.kind = "update_resource";
    step.args = {
      resource: {
        kind: "resource", args: {
          resource_type: stepArgs.resource_type,
          resource_id: stepArgs.resource_id,
        }
      }
    };
    const field = stepArgs.label;
    step.body = [{
      kind: "pair", args: {
        label: field == "discarded_at" ? "plant_stage" : field,
        value: field == "discarded_at" ? "removed" : stepArgs.value,
      }
    }];
  };

export function TileOldMarkAs(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence } = props;
  const oldStepArgs = currentStep.args as Record<LegalArgString, string>;
  const className = "update-resource-step";
  return <StepWrapper>
    <StepHeader
      className={className}
      helpText={ToolTips.MARK_AS}
      currentSequence={currentSequence}
      currentStep={currentStep}
      dispatch={dispatch}
      index={index}
      confirmStepDeletion={props.confirmStepDeletion} />
    <StepContent className={className}>
      <p>{trim(`Mark ${oldStepArgs.resource_type} ${oldStepArgs.resource_id}
          ${oldStepArgs.label} as ${oldStepArgs.value}`)}</p>
      <hr />
      <p>{"This step has been deprecated."}</p>
      {props.shouldDisplay?.(Feature.update_resource) &&
        <button className="fb-button yellow" style={{ float: "none" }}
          onClick={() => props.dispatch(editStep({
            step: props.currentStep,
            sequence: props.currentSequence,
            index: props.index,
            executor: convertOldMarkAs(props.currentStep),
          }))}>
          {"convert"}
        </button>}
    </StepContent>
  </StepWrapper>;
}
