import { editStep } from "../../api/crud";
import { WritePin, SequenceBodyItem, ALLOWED_PIN_MODES } from "farmbot";
import { DropDownItem } from "../../ui/index";
import { StepParams } from "../interfaces";
import { isNumber } from "lodash";
import { t } from "../../i18next_wrapper";

enum PinMode {
  digital = 0,
  analog = 1,
}

// tslint:disable-next-line:no-any
const isPinMode = (x: any): x is ALLOWED_PIN_MODES =>
  Object.values(PinMode).includes(x);

export const PIN_MODES = () => [
  { value: PinMode.analog, label: t("Analog") },
  { value: PinMode.digital, label: t("Digital") }
];

export const PIN_VALUES = () => [
  { value: 1, label: t("ON") },
  { value: 0, label: t("OFF") }
];

export function currentModeSelection(currentStep: SequenceBodyItem) {
  const step = currentStep as WritePin;
  const pinMode = step.args.pin_mode;
  const modes: { [s: string]: string } = {
    [PinMode.digital]: t("Digital"),
    [PinMode.analog]: t("Analog")
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
      if (isPinMode(x.value)) {
        step.args.pin_mode = x.value;
      } else {
        throw new Error("pin_mode must be one of ALLOWED_PIN_MODES.");
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
      if (isNumber(x.value)) {
        step.args.pin_value = x.value;
      } else {
        throw new Error("Numbers only in pin_value.");
      }
    }
  }));
}
