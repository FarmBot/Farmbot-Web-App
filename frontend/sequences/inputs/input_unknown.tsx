import * as React from "react";
import { StepInputProps } from "../interfaces";

export function InputUnknown({ field }: StepInputProps) {
  return <input type="text"
    placeholder={`UNEXPECTED INPUT '${(field || "empty").toString()}'`} />;
}
