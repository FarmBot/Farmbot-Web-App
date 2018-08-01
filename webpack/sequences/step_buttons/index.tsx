import * as React from "react";
import { t } from "i18next";
import { SequenceBodyItem as Step } from "farmbot";
import { error } from "farmbot-toastr";
import { StepDragger, NULL_DRAGGER_ID } from "../../draggable/step_dragger";
import { pushStep } from "../actions";
import { StepButtonParams } from "../interfaces";
import { Col } from "../../ui/index";
import { TaggedSequence } from "farmbot";

export const stepClick =
  (dispatch: Function, step: Step, seq: TaggedSequence | undefined) =>
    () => {
      (seq) ?
        pushStep(step, dispatch, seq) : error(t("Select a sequence first"));
    };

export function StepButton({ children, step, color, dispatch, current }:
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
          onClick={stepClick(dispatch, step, current)} >
          {children}
          <i className="fa fa-arrows block-control" />
        </button>
      </StepDragger>
    </div>
  </Col>;
}
