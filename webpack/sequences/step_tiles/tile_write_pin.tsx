import * as React from "react";
import { StepTitleBar } from "./step_title_bar";
import { splice, remove } from "./index";
import { t } from "i18next";
import { StepInputBox } from "../inputs/step_input_box";
import { StepParams } from "../interfaces";
import { ToolTips } from "../../constants";
import { StepIconGroup } from "../step_icon_group";
import { FBSelect } from "../../ui/new_fb_select";
import {
  setPinMode, PIN_MODES, setPinValue, currentValueSelection,
  PIN_VALUES, currentModeSelection
} from "./tile_pin_support";

export function TileWritePin(props: StepParams) {
  const { dispatch, currentStep, index, currentSequence } = props;
  const pinValueField = () => {
    if (currentStep.kind === "write_pin") {
      if (!(currentStep.args.pin_mode === 0) || currentStep.args.pin_value > 1) {
        return <StepInputBox dispatch={dispatch}
          step={currentStep}
          sequence={currentSequence}
          index={index}
          field="pin_value" />;
      } else {
        return <FBSelect
          onChange={(x) => setPinValue(x, props)}
          selectedItem={currentValueSelection(currentStep)}
          list={PIN_VALUES} />;
      }
    }
  };
  return (<div>
    <div className="step-wrapper">
      <div className="row">
        <div className="col-sm-12">
          <div className="step-header write-pin-step">
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
              helpText={t(ToolTips.WRITE_PIN)} />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <div className="step-content write-pin-step">
            <div className="row">
              <div className="col-xs-6 col-md-3">
                <label>{t("Pin Number")}</label>
                <StepInputBox dispatch={dispatch}
                  step={currentStep}
                  sequence={currentSequence}
                  index={index}
                  field="pin_number" />
              </div>
              <div className="col-xs-6 col-md-3">
                <label>{t("Value")}</label>
                {pinValueField()}
              </div>
              <div className="col-xs-6 col-md-3">
                <label>{t("Pin Mode")}</label>
                <FBSelect
                  onChange={(x) => setPinMode(x, props)}
                  selectedItem={currentModeSelection(currentStep)}
                  list={PIN_MODES} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>);
}
