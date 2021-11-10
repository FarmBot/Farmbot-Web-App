import React from "react";
import { SequenceBodyItem as Step, TaggedSequence } from "farmbot";
import { error } from "../toast/toast";
import { StepDragger, NULL_DRAGGER_ID } from "../draggable/step_dragger";
import { pushStep, closeCommandMenu } from "./actions";
import { StepButtonParams } from "./interfaces";
import { Col } from "../ui";
import { t } from "../i18next_wrapper";
import { Path } from "../internal_urls";

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
  return <Col xs={12} sm={Path.inDesigner() ? 6 : 12} lg={6}
    className={"step-block-wrapper"}>
    <div className="block">
      <StepDragger
        dispatch={dispatch}
        step={step}
        intent="step_splice"
        draggerId={NULL_DRAGGER_ID}>
        <button draggable={true}
          className={`fb-button full-width block step-block ${color}`}
          title={t("add step")}
          onClick={stepClick(dispatch, step, current, index)}>
          <div className="step-block-drag">
            <label>{children}</label>
            <i className="fa fa-arrows block-control" />
          </div>
        </button>
      </StepDragger>
    </div>
  </Col>;
}
