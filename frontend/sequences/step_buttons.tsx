import React from "react";
import { t } from "../i18next_wrapper";
import { SequenceBodyItem, TaggedSequence } from "farmbot";
import { Path } from "../internal_urls";
import { error } from "../toast/toast";
import { StepDragger, NULL_DRAGGER_ID } from "../draggable/step_dragger";
import { pushStep, closeCommandMenu } from "./actions";
import { StepButtonParams } from "./interfaces";

export const stepClick =
  (dispatch: Function,
    step: SequenceBodyItem,
    seq: TaggedSequence | undefined,
    index?: number | undefined) =>
    () => {
      seq
        ? pushStep(step, dispatch, seq, index)
        : error(t("Select a sequence first"));
      dispatch(closeCommandMenu());
    };

export function StepButton({ label, step, color, dispatch, current, index }:
  StepButtonParams) {
  const Dragger = () => <StepDragger
    dispatch={dispatch}
    step={step}
    intent="step_splice"
    draggerId={NULL_DRAGGER_ID}>
    <button draggable={true}
      className={[
        "fb-button",
        Path.inDesigner() ? "clustered" : "full-width block step-block",
        color,
      ].join(" ")}
      title={label}
      onClick={stepClick(dispatch, step, current, index)}>
      <div className="step-block-drag row">
        <label>{label}</label>
      </div>
    </button>
  </StepDragger>;
  return Path.inDesigner()
    ? <Dragger />
    : <div
      className={"step-block-wrapper"}>
      <div className="block">
        <Dragger />
      </div>
    </div>;
}
