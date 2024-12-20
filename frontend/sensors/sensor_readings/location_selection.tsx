import React from "react";
import { Row, BlurableInput } from "../../ui";
import { AxisInputBoxGroupState } from "../../controls/interfaces";
import { AxisInputBox } from "../../controls/axis_input_box";
import { isNumber } from "lodash";
import { LocationSelectionProps } from "./interfaces";
import { parseIntInput } from "../../util";
import { t } from "../../i18next_wrapper";
import { Xyz } from "farmbot";

/** Select a location filter for sensor readings. */
export const LocationSelection =
  ({ xyzLocation, deviation, setDeviation, setLocation }: LocationSelectionProps) =>
    <div>
      <Row className="grid-4-col">
        {["x", "y", "z"].map(axis =>
          <div key={axis + "_heading"}>
            <label>{axis}</label>
          </div>)}
        <label>{t("Deviation")}</label>
      </Row>
      <Row className="grid-4-col">
        {["x", "y", "z"].map((axis: Xyz) =>
          <AxisInputBox
            key={axis}
            axis={axis}
            value={xyzLocation ? xyzLocation[axis] : undefined}
            onChange={(a: Xyz, v) => {
              const newLocation = (xyzLocation || {});
              newLocation[a] = v;
              setLocation(newLocation);
            }} />)}
        <BlurableInput
          type="number"
          value={deviation}
          onCommit={e => setDeviation(parseIntInput(e.currentTarget.value))} />
      </Row>
    </div>;

/** Display sensor reading location filter settings. */
export const LocationDisplay = ({ xyzLocation, deviation }: {
  xyzLocation: AxisInputBoxGroupState | undefined,
  deviation: number
}) => {
  return <div className="location">
    {["x", "y", "z"].map((axis: Xyz) => {
      const axisString = () => {
        if (xyzLocation) {
          const axisValue = xyzLocation[axis];
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
