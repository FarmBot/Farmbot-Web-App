import * as React from "react";
import { isNaN } from "lodash";
import { AxisInputBoxProps, AxisInputBoxState } from "./interfaces";
import { Col, BlurableInput } from "../ui/index";
import { isUndefined } from "lodash";

export let AxisInputBox = ({ onChange, value, axis }: AxisInputBoxProps) => {
  return (
    <Col xs={3}>
      <BlurableInput
        value={(isUndefined(value) ? -1 : value)}
        type="number"
        onCommit={e => onChange(axis, parseInt(e.currentTarget.value))} />
    </Col>
  );
};
