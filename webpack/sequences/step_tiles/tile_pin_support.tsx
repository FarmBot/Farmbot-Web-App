import { t } from "i18next";
import { editStep } from "../../api/crud";
import * as _ from "lodash";
import { WritePin, SequenceBodyItem } from "farmbot";
import { DropDownItem } from "../../ui/index";
import { StepParams } from "../interfaces";

export const PIN_MODES = [
  { value: 1, label: t("Analog") },
  { value: 0, label: t("Digital") }
];

export const PIN_VALUES = [
  { value: 1, label: t("ON") },
  { value: 0, label: t("OFF") }
];

export function currentModeSelection(currentStep: SequenceBodyItem) {
  const step = currentStep as WritePin;
  const pinMode = step.args.pin_mode;
  const modes: { [s: string]: string } = {
    0: t("Digital"),
    1: t("Analog")
  };
  return { label: modes[pinMode], value: pinMode };
}

export function currentValueSelection(currentStep: SequenceBodyItem) {
  const step = currentStep as WritePin;
  const pinValue = step.args.pin_value;
  const values: { [s: string]: string } = {
    0: t("OFF"),
    1: t("ON")
  };
  return { label: values[pinValue], value: pinValue };
}

export function setPinMode(
  x: DropDownItem, { dispatch, currentStep, index, currentSequence }: StepParams) {
  dispatch(editStep({
    sequence: currentSequence,
    step: currentStep,
    index: index,
    executor: (step: WritePin) => {
      if (_.isNumber(x.value)) {
        step.args.pin_mode = x.value;
      } else {
        throw new Error("Numbers only in pin_mode.");
      }
    }
  }));
}

export function setPinValue(
  x: DropDownItem, { dispatch, currentStep, index, currentSequence }: StepParams) {
  dispatch(editStep({
    sequence: currentSequence,
    step: currentStep,
    index: index,
    executor: (step: WritePin) => {
      if (_.isNumber(x.value)) {
        step.args.pin_value = x.value;
      } else {
        throw new Error("Numbers only in pin_value.");
      }
    }
  }));
}
