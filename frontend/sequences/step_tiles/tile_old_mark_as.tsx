import React from "react";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepWrapper } from "../step_ui";
import { editStep } from "../../api/crud";
import { SequenceBodyItem, LegalArgString } from "farmbot";
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

export const TileOldMarkAs = (props: StepParams) => {
  const { dispatch, currentStep, index, currentSequence } = props;
  const oldStepArgs = currentStep.args as Record<LegalArgString, string>;
  return <StepWrapper {...props}
    className={"update-resource-step"}
    helpText={ToolTips.MARK_AS}>
    <p>{trim(`Mark ${oldStepArgs.resource_type} ${oldStepArgs.resource_id}
          ${oldStepArgs.label} as ${oldStepArgs.value}`)}</p>
    <hr />
    <p>{"This step has been deprecated."}</p>
    <button className="fb-button yellow" style={{ float: "none" }}
      onClick={() => dispatch(editStep({
        step: currentStep,
        sequence: currentSequence,
        index: index,
        executor: convertOldMarkAs(currentStep),
      }))}>
      {"convert"}
    </button>
  </StepWrapper>;
};
