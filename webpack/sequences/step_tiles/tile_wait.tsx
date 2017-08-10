import * as React from "react";
import { StepTitleBar } from "./step_title_bar";
import { splice, remove } from "./index";
import { t } from "i18next";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepIconGroup } from "../step_icon_group";

export function TileWait({ dispatch, currentStep, index, currentSequence }: StepParams) {
  return (<div>
    <div className="step-wrapper">
      <div className="row">
        <div className="col-sm-12">
          <div className="step-header wait-step">
            <StepTitleBar index={index}
              dispatch={dispatch}
              step={currentStep}
              sequence={currentSequence} />
            <StepIconGroup
              onClone={() => dispatch(splice({
                step: currentStep,
                sequence: currentSequence,
                index
              }))}
              onTrash={() => remove({ dispatch, index, sequence: currentSequence })}
              helpText={t(ToolTips.WAIT)} />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <div className="step-content wait-step">
            <div className="row">
              <div className="col-xs-6 col-md-3">
                <label>{t("Time in milliseconds")}</label>
                <StepInputBox dispatch={dispatch}
                  step={currentStep}
                  sequence={currentSequence}
                  index={index}
                  field="milliseconds" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>);

}
