import React from "react";
import { readPin } from "../devices/actions";
import { SensorListProps } from "./interfaces";
import { sortResourcesById } from "../util";
import { Row } from "../ui";
import { isNumber } from "lodash";
import { ALLOWED_PIN_MODES } from "farmbot";
import { t } from "../i18next_wrapper";

interface SensorReadingDisplayProps {
  label: string;
  value: number | undefined;
  mode: number;
}

interface CalcStyleProps {
  value: number;
  mode: number;
}

const calcIndicatorStyle = ({ value, mode }: CalcStyleProps) => ({
  left: `calc(${(mode
    ? value / 1024 * 0.95 // analog
    : value / 2) // digital
    * 100}%)`,
  width: `${mode ? 5 : 50}%`
});

const calcValueStyle = ({ value, mode }: CalcStyleProps) => ({
  marginLeft: `${mode
    ? `${value > 500 ? -3.5 : 1.5}rem` // analog
    : "0"}`, // digital
  color: `${mode ? "" : "white"}`
});

const SensorReadingDisplay =
  ({ label, value, mode }: SensorReadingDisplayProps) => {
    const moistureSensor = label.toLowerCase().includes("moisture")
      ? "moisture-sensor"
      : "";
    const toolSensor = label.toLowerCase().includes("verification")
      ? "tool-verification-sensor"
      : "";
    const valueLabel = toolSensor
      ? `${value} (${value ? t("NO TOOL") : t("TOOL ON")})`
      : value;
    const classNames = [
      "sensor-reading-display",
      moistureSensor, toolSensor,
      mode ? "analog" : "digital",
    ];
    return <div className={classNames.join(" ")}>
      {isNumber(value) && value >= 0 &&
        <div className="indicator" style={calcIndicatorStyle({ value, mode })}>
          <span style={calcValueStyle({ value, mode })}>
            {valueLabel}
          </span>
        </div>}
    </div>;
  };

export const SensorList = (props: SensorListProps) =>
  <div className="grid">
    {sortResourcesById(props.sensors).map(sensor => {
      const { label, mode, pin } = sensor.body;
      const pinNumber = (isNumber(pin) && isFinite(pin)) ? pin : -1;
      const value = (props.pins[pinNumber] || { value: undefined }).value;
      return <Row key={sensor.uuid} className="grid-exp-1">
        <label>{label}</label>
        <p>{pinNumber}</p>
        <SensorReadingDisplay label={label} value={value} mode={mode} />
        <ReadSensorButton
          disabled={!!props.disabled}
          sensorLabel={label}
          pinNumber={pinNumber}
          mode={mode} />
      </Row>;
    })}
  </div>;

interface ReadSensorButtonProps {
  disabled: boolean;
  sensorLabel: string;
  pinNumber: number;
  mode: number;
}

const ReadSensorButton = (props: ReadSensorButtonProps) => {
  const { disabled, sensorLabel, pinNumber, mode } = props;
  return <button
    className={"fb-button gray"}
    disabled={disabled}
    title={t(`read ${sensorLabel} sensor`)}
    onClick={() => {
      readPin(pinNumber, `pin${pinNumber}`, mode as ALLOWED_PIN_MODES);
    }}>
    {t("read sensor")}
  </button>;
};
