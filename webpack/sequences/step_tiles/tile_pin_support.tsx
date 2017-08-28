import { editStep } from "../../api/crud";
import * as _ from "lodash";
import { WritePin, SequenceBodyItem } from "farmbot";
import { DropDownItem } from "../../ui/index";
import { StepParams } from "../interfaces";

export const PIN_MODES = [
  { value: 1, label: "Analog" },
  { value: 0, label: "Digital" }
];

export function currentSelection(currentStep: SequenceBodyItem) {
  const step = currentStep as WritePin;
  const pinMode = step.args.pin_mode;
  const modes: { [s: string]: string } = {
    0: "Digital",
    1: "Analog"
  };
  return { label: modes[pinMode], value: pinMode };
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
