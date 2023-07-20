import React from "react";
import { Row, Col } from "../ui";
import { AxisDisplayGroupProps, AxisProps } from "./interfaces";
import { isNumber, isUndefined } from "lodash";
import { t } from "../i18next_wrapper";
import { MissedStepIndicator } from "./move/missed_step_indicator";
import { DevSettings } from "../settings/dev/dev_support";

const Axis = (props: AxisProps) => {
  const { axis, val, missedSteps, axisState, index, detectionEnabled } = props;
  return <Col xs={3} className={"index-" + index}>
    {isNumber(missedSteps) && missedSteps >= 0 && detectionEnabled &&
      <MissedStepIndicator
        missedSteps={axisState == "idle" ? 0 : missedSteps}
        axis={axis} />}
    {!props.noValues &&
      <input disabled name={axis}
        style={props.highlight ? { border: "2px solid #fd6" } : {}}
        value={isNumber(val) ? val : "---"} />}
    {!isUndefined(axisState) && DevSettings.futureFeaturesEnabled() &&
      <p>{t(axisState)}</p>}
  </Col>;
};

export const AxisDisplayGroup = (props: AxisDisplayGroupProps) => {
  const { x, y, z } = props.position;
  const detectionEnabled = {
    x: !!props.firmwareSettings?.encoder_enabled_x,
    y: !!props.firmwareSettings?.encoder_enabled_y,
    z: !!props.firmwareSettings?.encoder_enabled_z,
  };
  const common = { noValues: props.noValues };
  return <Row>
    <Axis {...common} axis={"x"} val={x} busy={props.busy} index={3}
      detectionEnabled={detectionEnabled.x}
      missedSteps={props.missedSteps?.x}
      highlight={props.highlightAxis == "x"}
      axisState={props.axisStates?.x} />
    <Axis {...common} axis={"y"} val={y} busy={props.busy} index={2}
      detectionEnabled={detectionEnabled.y}
      missedSteps={props.missedSteps?.y}
      highlight={props.highlightAxis == "y"}
      axisState={props.axisStates?.y} />
    <Axis {...common} axis={"z"} val={z} busy={props.busy} index={1}
      detectionEnabled={detectionEnabled.z}
      missedSteps={props.missedSteps?.z}
      highlight={props.highlightAxis == "z"}
      axisState={props.axisStates?.z} />
    {!props.noValues &&
      <Col xs={3} className={"no-pad"}>
        <label style={props.style}>
          {t(props.label)}
        </label>
      </Col>}
  </Row>;
};
