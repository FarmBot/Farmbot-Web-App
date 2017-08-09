import * as React from "react";
import { StepParams } from "../interfaces";
import { StepTitleBar } from "./step_title_bar";
import { splice, remove } from "./index";
import { t } from "i18next";
import { Link } from "react-router";
import { ToolTips } from "../../constants";
import { StepIconGroup } from "../step_icon_group";

export function TileTakePhoto({ dispatch, currentStep, index, currentSequence }: StepParams) {
  return (<div>
    <div className="step-wrapper">
      <div className="row">
        <div className="col-sm-12">
          <div className="step-header take-photo-step">
            <StepTitleBar index={index}
              dispatch={dispatch}
              step={currentStep}
              sequence={currentSequence} />
            <StepIconGroup
              onClone={() => dispatch(splice({
                step: currentStep,
                index,
                sequence: currentSequence
              }))}
              onTrash={() => remove({ dispatch, index, sequence: currentSequence })}
              helpText={t(ToolTips.TAKE_PHOTO)} />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <div className="step-content take-photo-step">
            <div className="row">
              <div className="col-xs-12">
                <p>
                  Photos are viewable from the <Link to="/app/farmware">
                    farmware page</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>);

}
