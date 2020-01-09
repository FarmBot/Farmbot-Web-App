import * as React from "react";
import { AxisInputBoxProps } from "./interfaces";
import { Col, BlurableInput } from "../ui/index";

export const AxisInputBox = ({ onChange, value, axis }: AxisInputBoxProps) => {
  return <Col xs={3}>
    <BlurableInput
      value={value ?? ""}
      type="number"
      allowEmpty={true}
      onCommit={e => {
        const val = parseFloat(e.currentTarget.value);
        onChange(axis, isNaN(val) ? undefined : val);
      }} />
  </Col>;
};
