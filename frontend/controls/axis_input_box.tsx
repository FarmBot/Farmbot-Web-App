import React from "react";
import { AxisInputBoxProps } from "./interfaces";
import { BlurableInput } from "../ui";

export const AxisInputBox = ({ onChange, value, axis }: AxisInputBoxProps) => {
  return <BlurableInput
    value={value ?? ""}
    type="number"
    allowEmpty={true}
    onCommit={e => {
      const val = parseFloat(e.currentTarget.value);
      onChange(axis, isNaN(val) ? undefined : val);
    }} />;
};
