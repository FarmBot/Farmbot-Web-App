import * as React from "react";
import { StepParams } from "../interfaces";
import { StepTitleBar } from "./step_title_bar";
import { Help } from "../../ui";
import { splice, remove } from "./index";
import { t } from "i18next";
import { Link } from "react-router";
import { ToolTips } from "../../constants";

export function TileTakePhoto({ dispatch, currentStep, index, currentSequence }: StepParams) {
  return (<div>
    <div className="step-wrapper">
      <div className="row">
        <div className="col-sm-12">
          <div className="step-header take-photo-step">
            <StepTitleBar index={index}
              dispatch={dispatch}
              step={currentStep} />
            <i className="fa fa-arrows-v step-control" />
            <i className="fa fa-clone step-control"
              onClick={() => dispatch(splice({
                step: currentStep,
                index,
                sequence: currentSequence
              }))} />
            <i className="fa fa-trash step-control"
              onClick={() => remove({ dispatch, index, sequence: currentSequence })} />
            <Help text={t(ToolTips.TAKE_PHOTO)} />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <div className="step-content take-photo-step">
            <div className="row">
              <div className="col-xs-12">
                <p>
                  Photos are viewable from the <Link to="/app/device">
                    devices page</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>);

}
