import * as React from "react";
import { InputUnknown } from "./input_unknown";
import { InputDefault } from "./input_default";
import { StepInputProps } from "../interfaces";

export function StepInputBox(props: StepInputProps) {
  if (props.fieldOverride) { return <InputDefault {...props} />; }
  switch (props.field) {
    case "label": case "lhs": case "message": case "milliseconds": case "op":
    case "pin_mode": case "pin_number": case "pin_value": case "rhs":
    case "sequence_id":
    case "x": case "y": case "z":
    case "speed":
      return <InputDefault {...props} />;
    default:
      return <InputUnknown {...props} />;
  }
}
