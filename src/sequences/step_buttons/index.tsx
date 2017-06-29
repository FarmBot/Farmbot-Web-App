import * as React from "react";
import { SequenceBodyItem as Step } from "farmbot";
import { error } from "farmbot-toastr";
import { StepDragger, NULL_DRAGGER_ID } from "../../draggable/step_dragger";
import { pushStep } from "../actions";
import { StepButtonParams } from "../interfaces";
import { Col } from "../../ui/index";
import { TaggedSequence } from "../../resources/tagged_resources";

let click = (dispatch: Function, step: Step, seq: TaggedSequence | undefined) =>
  (event: React.FormEvent<HTMLButtonElement>) => {
    if (seq) {
      pushStep(step, dispatch, seq);
    } else {
      error("Select a sequence first")
    }
  };

export function StepButton({ children, step, color, dispatch, current }:
  StepButtonParams) {
  return <Col xs={6} sm={12}>
    <div className="block-wrapper">
      <StepDragger dispatch={dispatch}
        step={step}
        ghostCss="step-drag-ghost-image"
        intent="step_splice"
        draggerId={NULL_DRAGGER_ID}>
        <button className={
          `fb-button full-width text-left ${color} block-header block`
        }
          onClick={click(dispatch, step, current)}>
          {children}
          <i className="fa fa-arrows block-control" />
        </button>
      </StepDragger>
    </div>
  </Col>;
}
