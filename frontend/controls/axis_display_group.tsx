import * as React from "react";
import { Row, Col } from "../ui/index";
import { AxisDisplayGroupProps, AxisProps } from "./interfaces";
import { isNumber } from "lodash";
import { t } from "../i18next_wrapper";
import { MissedStepIndicator } from "./move/missed_step_indicator";

const Axis = ({ axis, val, missedSteps }: AxisProps) =>
  <Col xs={3}>
    {isNumber(missedSteps) && <MissedStepIndicator missedSteps={missedSteps} />}
    <input disabled name={axis} value={isNumber(val) ? val : "---"} />
  </Col>;

export const AxisDisplayGroup = (props: AxisDisplayGroupProps) => {
  const { x, y, z } = props.position;
  return <Row>
    <Axis axis={"x"} val={x} missedSteps={props.missedSteps?.x} />
    <Axis axis={"y"} val={y} missedSteps={props.missedSteps?.y} />
    <Axis axis={"z"} val={z} missedSteps={props.missedSteps?.z} />
    <Col xs={3}>
      <label>
        {t(props.label)}
      </label>
    </Col>
  </Row>;
};
