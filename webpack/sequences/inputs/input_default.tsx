import * as React from "react";
import { updateStep } from "../step_tiles/index";
import { isString, isNumber } from "lodash";
import { StepInputProps } from "../interfaces";
import { BlurableInput } from "../../ui";

export function InputDefault({
  step,
  field,
  dispatch,
  sequence,
  type_,
  index
}: StepInputProps) {
  let raw = (step.args as any)[field];
  let notUndefied = (isString(raw) || isNumber(raw));
  let val = notUndefied ? raw : "";

  return (
    <BlurableInput
      type={type_ || "text"}
      value={val}
      onCommit={updateStep({ dispatch, step, field, index, sequence })}
    />
  );
}
