import * as React from "react";
import { SequenceBodyItem as Step, TaggedSequence } from "farmbot";
import { error } from "farmbot-toastr";
import { StepDragger, NULL_DRAGGER_ID } from "../../draggable/step_dragger";
import { pushStep, closeCommandMenu } from "../actions";
import { StepButtonParams } from "../interfaces";
import { Col } from "../../ui/index";
import { t } from "../../i18next_wrapper";

export const stepClick =
  (dispatch: Function,
    step: Step,
    seq: TaggedSequence | undefined,
    index?: number | undefined) =>
    () => {
      seq
        ? pushStep(step, dispatch, seq, index)
        : error(t("Select a sequence first"));
      dispatch(closeCommandMenu());
    };

export function StepButton({ children, step, color, dispatch, current, index }:
  StepButtonParams) {
  return <Col xs={6} sm={12}>
    <div className="block">
      <StepDragger
        dispatch={dispatch}
        step={step}
        intent="step_splice"
        draggerId={NULL_DRAGGER_ID} >
        <button draggable={true}
          className={`fb-button full-width block ${color}`}
          onClick={stepClick(dispatch, step, current, index)} >
          {children}
          <i className="fa fa-arrows block-control" />
        </button>
      </StepDragger>
    </div>
  </Col>;
}
