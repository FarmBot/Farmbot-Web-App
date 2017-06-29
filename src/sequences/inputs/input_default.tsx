import * as React from "react";
import { updateStep } from "../step_tiles/index";
import { isString, isNumber } from "lodash";
import { StepInputProps } from "../interfaces";

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

  return <input type={type_ || "text"}
    value={val}
    onChange={updateStep({ dispatch, step, field, index, sequence })} />;
}
