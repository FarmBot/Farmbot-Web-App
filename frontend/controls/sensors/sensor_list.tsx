import * as React from "react";
import { readPin } from "../../devices/actions";
import { SensorListProps } from "./interfaces";
import { sortResourcesById } from "../../util";
import { Row, Col } from "../../ui";
import { t } from "i18next";
import { isNumber } from "lodash";
import { ALLOWED_PIN_MODES } from "farmbot";

const SensorReadingDisplay =
  ({ label, value, mode }:
    { label: string, value: number | undefined, mode: number }) => {
    const moistureSensor = label.toLowerCase().includes("moisture") ?
      "moisture-sensor" : "";
    return <div className={`sensor-reading-display ${moistureSensor}`}>
      {isNumber(value) && value >= 0 &&
        <div className="indicator"
          style={{
            left: `calc(${
              (mode
                ? value / 1024 * 0.95 // analog
                : value / 2) // digital
              * 100}%)`,
            width: `${mode ? 5 : 50}%`
          }}>
          <span style={{
            marginLeft: `${mode
              ? `${value > 500 ? -3.5 : 1.5}rem`
              : "7rem"}`,
            color: `${mode ? "" : "white"}`
          }}>
            {value}
          </span>
        </div>}
    </div>;
  };

export function SensorList(props: SensorListProps) {
  const { pins, disabled } = props;
  return <div>
    {sortResourcesById(props.sensors).map(p => {
      const { label, mode, pin } = p.body;
      const value = (pins[pin || -1] || { value: undefined }).value;
      return <Row key={p.uuid + p.body.id}>
        <Col xs={3}>
          <label>{label}</label>
        </Col>
        <Col xs={1}>
          <p>{pin}</p>
        </Col>
        <Col xs={6}>
          <SensorReadingDisplay label={label} value={value} mode={mode} />
        </Col>
        <Col xs={2}>
          <button
            className={"fb-button gray"}
            disabled={disabled}
            title={t(`read ${label} sensor`)}
            onClick={() => readPin(pin || 0, `pin${pin}`, mode as ALLOWED_PIN_MODES)}>
            {t("read sensor")}
          </button>
        </Col>
      </Row>;
    })}
  </div>;
}
