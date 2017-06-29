import * as React from "react";
import { StepParams } from "../interfaces";
import { StepTitleBar } from "./step_title_bar";
import { Help } from "../../ui";
import { splice, remove } from "./index";
import { t } from "i18next";
import { ToolTips } from "../../constants";

export function TileExecuteScript({ dispatch, currentStep, index, currentSequence }: StepParams) {
  if (currentStep.kind === "execute_script") {
    return (<div>
      <div className="step-wrapper">
        <div className="row">
          <div className="col-sm-12">
            <div className="step-header execute-script-step">
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
              <Help text={t(ToolTips.EXECUTE_SCRIPT)} />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12">
            <div className="step-content execute-script-step">
              <div className="row">
                <div className="col-xs-12">
                  <label>{t("Package Name")}</label>
                  <input type="text" value={currentStep.args.label} disabled={true} />
                  <small>NOTE: Support for customizable scripts is coming soon.</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
  } else {
    return <p> ERROR </p>;
  }
}
