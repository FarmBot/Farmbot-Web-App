import * as React from "react";
import { updateStep } from "../step_tiles/index";
import { isString, isNumber } from "lodash";
import { StepInputProps } from "../interfaces";
import { BlurableInput } from "../../ui/index";
import { Dictionary } from "farmbot/dist";

export function InputDefault({
  step,
  field,
  dispatch,
  sequence,
  type_,
  index
}: StepInputProps) {
  const raw = (step.args as Dictionary<string | number | undefined>)[field];
  const val = (isNumber(raw) || isString(raw)) ? raw : "";

  return <BlurableInput
    type={type_ || "text"}
    value={val}
    onCommit={updateStep({ dispatch, step, field, index, sequence })} />;
}
