import React from "react";
import { DropDownItem, FBSelect } from "../../../ui";
import { isNumber } from "lodash";
import { WritePin } from "farmbot";
import { StepParams } from "../../interfaces";
import { editStep } from "../../../api/crud";
import { t } from "../../../i18next_wrapper";
import { Slider } from "@blueprintjs/core";

export interface PinValueFieldProps extends StepParams {
  currentStep: WritePin;
}

export const PinValueField = (props: PinValueFieldProps): React.ReactNode => {
  const { currentStep, currentSequence } = props;
  const analogMode = !(currentStep.args.pin_mode === 0);
  const analogValue = currentStep.args.pin_value > 1;
  return <div className="row grid-2-col">
    <label>{t("set to")}</label>
    {analogMode || analogValue
      /** Analog pin mode: display slider for pin value. */
      ? <div className={"slider-container"}>
        <Slider
          min={0}
          max={255}
          labelStepSize={255}
          value={currentStep.args.pin_value}
          onChange={value => setPinValue(value, props)} />
      </div>
      /** Digital mode: replace pin value input with an ON/OFF dropdown. */
      : <FBSelect
        key={JSON.stringify(currentSequence)}
        onChange={ddi => setPinValueFromDdi(ddi, props)}
        selectedItem={currentValueSelection(currentStep)}
        list={PIN_VALUES()} />}
  </div>;
};

export function setPinValue(value: number, stepParams: StepParams) {
  const { dispatch, currentStep, index, currentSequence } = stepParams;
  dispatch(editStep({
    sequence: currentSequence,
    step: currentStep,
    index: index,
    executor: (step: WritePin) => step.args.pin_value = value,
  }));
}

export function setPinValueFromDdi(ddi: DropDownItem, stepParams: StepParams) {
  if (isNumber(ddi.value)) {
    setPinValue(ddi.value, stepParams);
  } else {
    throw new Error("Numbers only in pin_value.");
  }
}

export function currentValueSelection(currentStep: WritePin) {
  const step = currentStep;
  const pinValue = step.args.pin_value;
  const values: { [s: string]: string } = {
    0: t("OFF"),
    1: t("ON")
  };
  return { label: values[pinValue], value: pinValue };
}

export const PIN_VALUES = () => [
  { value: 1, label: t("ON") },
  { value: 0, label: t("OFF") },
];
