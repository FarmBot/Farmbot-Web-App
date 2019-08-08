import * as React from "react";
import { Row, Col, BlurableInput } from "../../ui";
import { AxisInputBoxGroupState } from "../interfaces";
import { Xyz } from "../../devices/interfaces";
import { AxisInputBox } from "../axis_input_box";
import { isNumber } from "lodash";
import { LocationSelectionProps } from "./interfaces";
import { parseIntInput } from "../../util";
import { t } from "../../i18next_wrapper";

/** Select a location filter for sensor readings. */
export const LocationSelection =
  ({ location, deviation, setDeviation, setLocation }: LocationSelectionProps) =>
    <div className="sensor-history-location-selection">
      <Row>
        {["x", "y", "z"].map(axis =>
          <Col key={axis + "_heading"} xs={3}>
            <label>{axis}</label>
          </Col>)}
        <Col xs={3}>
          <label>{t("Deviation")}</label>
        </Col>
      </Row>
      <Row>
        {["x", "y", "z"].map((axis: Xyz) =>
          <AxisInputBox
            key={axis}
            axis={axis}
            value={location ? location[axis] : undefined}
            onChange={(a: Xyz, v) => {
              const newLocation = (location || {});
              newLocation[a] = v;
              setLocation(newLocation);
            }} />)}
        <Col xs={3}>
          <BlurableInput
            type="number"
            value={deviation}
            onCommit={e => setDeviation(parseIntInput(e.currentTarget.value))} />
        </Col>
      </Row>
    </div>;

/** Display sensor reading location filter settings. */
export const LocationDisplay = ({ location, deviation }: {
  location: AxisInputBoxGroupState | undefined,
  deviation: number
}) => {
  return <div className="location">
    {["x", "y", "z"].map((axis: Xyz) => {
      const axisString = () => {
        if (location) {
          const axisValue = location[axis];
          if (isNumber(axisValue)) {
            return deviation
              ? `${axisValue - deviation}–${axisValue + deviation}`
              : `${axisValue}`;
          }
        }
      };
      return <div key={axis}>
        <label>{axis}:</label>
        <span>{axisString() || t("any")}</span>
      </div>;
    })}
  </div>;
};
