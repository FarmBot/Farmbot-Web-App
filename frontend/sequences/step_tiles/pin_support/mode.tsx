import React from "react";
import { DropDownItem, FBSelect } from "../../../ui";
import { SequenceBodyItem, ALLOWED_PIN_MODES, WritePin, ReadPin } from "farmbot";
import { StepParams } from "../../interfaces";
import { editStep } from "../../../api/crud";
import { t } from "../../../i18next_wrapper";
import { isBoxLed } from "./index";

export function PinModeDropdown(props: StepParams<ReadPin | WritePin>) {
  return <div className="row grid-2-col">
    <label>{t("Mode")}</label>
    <FBSelect
      key={JSON.stringify(props.currentSequence)}
      onChange={ddi => setPinMode(ddi, props)}
      selectedItem={currentModeSelection(props.currentStep)}
      list={getPinModes(props.currentStep)} />
  </div>;
}

export function setPinMode(ddi: DropDownItem, stepParams: StepParams) {
  const { dispatch, currentStep, index, currentSequence } = stepParams;
  dispatch(editStep({
    sequence: currentSequence,
    step: currentStep,
    index: index,
    executor: (step: WritePin | ReadPin) => {
      if (isPinMode(ddi.value)) {
        step.args.pin_mode = ddi.value;
        if (step.kind == "read_pin") { return; }
        switch (ddi.value) {
          case PinMode.digital:
            step.args.pin_value = Math.min(step.args.pin_value, 1);
            break;
          case PinMode.analog:
            step.args.pin_value = step.args.pin_value == 1 ? 255 : 0;
            break;
        }
      } else {
        throw new Error("pin_mode must be one of ALLOWED_PIN_MODES.");
      }
    }
  }));
}

export function currentModeSelection(currentStep: ReadPin | WritePin) {
  const step = currentStep;
  const pinMode = step.args.pin_mode;
  const modes: { [s: string]: string } = {
    [PinMode.digital]: t("Digital"),
    [PinMode.analog]: t("Analog")
  };
  return { label: modes[pinMode], value: pinMode };
}

export enum PinMode {
  digital = 0,
  analog = 1,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isPinMode = (x: any): x is ALLOWED_PIN_MODES =>
  Object.values(PinMode).includes(x as PinMode);

export const getPinModes = (step?: SequenceBodyItem) => [
  ...(step && isBoxLed(step)
    ? []
    : [{ value: PinMode.analog, label: t("Analog") }]),
  { value: PinMode.digital, label: t("Digital") },
];
