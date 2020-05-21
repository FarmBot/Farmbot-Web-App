import * as React from "react";
import { Row, Col } from "../ui/index";
import { AxisDisplayGroupProps, AxisProps } from "./interfaces";
import { isNumber, isUndefined } from "lodash";
import { t } from "../i18next_wrapper";
import { MissedStepIndicator } from "./move/missed_step_indicator";
import { DevSettings } from "../account/dev/dev_support";

const Axis = ({ axis, val, missedSteps, axisState }: AxisProps) =>
  <Col xs={3}>
    {isNumber(missedSteps) && <MissedStepIndicator missedSteps={missedSteps} />}
    <input disabled name={axis} value={isNumber(val) ? val : "---"} />
    {!isUndefined(axisState) && DevSettings.futureFeaturesEnabled() &&
      <p>{t(axisState)}</p>}
  </Col>;

export const AxisDisplayGroup = (props: AxisDisplayGroupProps) => {
  const { x, y, z } = props.position;
  return <Row>
    <Axis axis={"x"} val={x}
      missedSteps={props.missedSteps?.x}
      axisState={props.axisStates?.x} />
    <Axis axis={"y"} val={y}
      missedSteps={props.missedSteps?.y}
      axisState={props.axisStates?.y} />
    <Axis axis={"z"} val={z}
      missedSteps={props.missedSteps?.z}
      axisState={props.axisStates?.z} />
    <Col xs={3}>
      <label>
        {t(props.label)}
      </label>
    </Col>
  </Row>;
};
