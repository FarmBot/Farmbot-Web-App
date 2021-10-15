import React from "react";
import { updateStep } from "../step_tiles/index";
import { isString, isNumber } from "lodash";
import { StepInputProps } from "../interfaces";
import { BlurableInput } from "../../ui";
import { Dictionary } from "farmbot";

export function InputDefault({
  step,
  field,
  dispatch,
  sequence,
  type_,
  index,
  keyCallback,
}: StepInputProps) {
  const raw = (step.args as Dictionary<string | number | undefined>)[field];
  const val = (isNumber(raw) || isString(raw)) ? raw : "";

  return <BlurableInput
    type={type_ || "text"}
    value={val}
    keyCallback={keyCallback}
    onCommit={updateStep({ dispatch, step, field, index, sequence })} />;
}
