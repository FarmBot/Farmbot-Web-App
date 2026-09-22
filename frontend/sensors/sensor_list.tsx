import React from "react";
import { readPin } from "../devices/actions";
import { SensorListProps } from "./interfaces";
import { sortResourcesById } from "../util";
import { Popover, Row } from "../ui";
import { isNumber } from "lodash";
import { ALLOWED_PIN_MODES, TaggedPeripheral } from "farmbot";
import { Position } from "@blueprintjs/core";
import { SensorType } from "farmbot/dist/resources/api_resources";
import { t } from "../i18next_wrapper";
import { PinTypeEmoji } from "../controls/pin_form_fields";
import { currentSensorPeripherals } from
  "../controls/current_sensor_mapping";
import { PeripheralControl } from
  "../controls/peripherals/peripheral_list";

export interface SensorReadingDisplayProps {
  type: SensorType;
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

export const SensorReadingDisplay =
  ({ type, value, mode }: SensorReadingDisplayProps) => {
    const moistureSensor = type == "soil_moisture"
      ? "moisture-sensor"
      : "";
    const toolSensor = type == "tool_verification"
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
      const { label, mode, pin, type } = sensor.body;
      const pinNumber = (isNumber(pin) && isFinite(pin)) ? pin : -1;
      const value = (props.pins[pinNumber] || { value: undefined }).value;
      const peripherals = currentSensorPeripherals(
        sensor, props.peripherals);
      return <Row key={sensor.uuid} className={"sensor-grid-row"}>
        <label>{label}</label>
        <div className={"sensor-type-emojis"}>
          <PinTypeEmoji type={type} />
          <PeripheralEmojiToggle
            peripherals={peripherals}
            pins={props.pins}
            disabled={props.disabled}
            locked={props.locked} />
        </div>
        <p>{pinNumber}</p>
        <SensorReadingDisplay type={type} value={value} mode={mode} />
        <ReadSensorButton
          disabled={!!props.disabled}
          sensorLabel={label}
          pinNumber={pinNumber}
          mode={mode} />
      </Row>;
    })}
  </div>;

interface PeripheralEmojiToggleProps {
  peripherals: TaggedPeripheral[];
  pins: SensorListProps["pins"];
  disabled: boolean | undefined;
  locked: boolean;
}

const PeripheralEmojiToggle = (props: PeripheralEmojiToggleProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const firstPeripheral = props.peripherals[0];
  if (!firstPeripheral) { return <PinTypeEmoji type={undefined} />; }
  const { label, type } = firstPeripheral.body;
  return <Popover
    position={Position.TOP}
    isOpen={isOpen}
    target={<button
      type={"button"}
      className={"sensor-peripheral-emoji-button"}
      title={t("Show {{peripheral}} controls", { peripheral: label })}
      onClick={() => setIsOpen(!isOpen)}>
      <PinTypeEmoji type={type} />
    </button>}
    content={<div className={"sensor-peripheral-toggle grid"}>
      {props.peripherals.map(peripheral =>
        <div className={"sensor-peripheral-toggle-row row"}
          key={peripheral.uuid}>
          <label>{peripheral.body.label}</label>
          <PeripheralControl
            peripheral={peripheral}
            pins={props.pins}
            disabled={props.disabled}
            locked={props.locked} />
        </div>)}
    </div>} />;
};

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
    {t("read")}
  </button>;
};
