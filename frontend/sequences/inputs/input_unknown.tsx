import React from "react";
import { StepInputProps } from "../interfaces";

export function InputUnknown({ field }: StepInputProps) {
  return <input type="text" name="unknown"
    placeholder={`UNEXPECTED INPUT '${(field || "empty").toString()}'`} />;
}
