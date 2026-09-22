import React from "react";
import {
  ALLOWED_PIN_MODES, Pins, TaggedPeripheral, TaggedSensor, TaggedTool,
} from "farmbot";
import { t } from "../i18next_wrapper";
import { ToggleButton } from "../ui";
import { pinToggle, readPin } from "../devices/actions";
import { isNumber } from "lodash";
import {
  PeripheralType, SensorType, ToolType,
} from "farmbot/dist/resources/api_resources";
import { PeripheralValues } from
  "../farm_designer/map/layers/farmbot/bot_trail";
import { currentSensorMatchesPeripheralTypes } from
  "../controls/current_sensor_mapping";
import { SensorReadingDisplay } from "../sensors/sensor_list";

export interface ToolActionRowProps {
  mountedTool: TaggedTool | undefined;
  sensors: TaggedSensor[];
  peripherals: TaggedPeripheral[];
  peripheralValues: PeripheralValues;
  pins: Pins;
  botOnline: boolean;
  arduinoBusy: boolean;
  locked: boolean;
  className?: string;
}

interface PeripheralToggleProps extends ToolActionRowProps {
  peripheral: TaggedPeripheral;
}

const PeripheralToggle = (props: PeripheralToggleProps) => {
  const pin = props.peripheral.body.pin;
  const label = props.peripheral.body.label;
  const value = props.peripheralValues.find(peripheral =>
    peripheral.uuid == props.peripheral.uuid)?.value;
  return <div className={"tool-peripheral-action row half-gap"}>
    <span>{t(label)}</span>
    <ToggleButton
      toggleValue={value}
      toggleAction={() => { if (isNumber(pin)) { void pinToggle(pin); } }}
      disabled={!isNumber(pin) || !props.botOnline
        || props.arduinoBusy || props.locked}
      title={t("Toggle {{peripheral}}", { peripheral: label })}
      customText={{ textFalse: t("off"), textTrue: t("on") }} />
  </div>;
};

interface SensorReadButtonProps extends ToolActionRowProps {
  sensor: TaggedSensor;
}

const SensorReadButton = (props: SensorReadButtonProps) => {
  const pin = props.sensor.body.pin;
  const pinNumber = isNumber(pin) ? pin : -1;
  const value = props.pins[pinNumber]?.value;
  const readSensor = () => {
    if (isNumber(pin)) {
      readPin(pin, `pin${pin}`,
        props.sensor.body.mode as ALLOWED_PIN_MODES);
    }
  };
  return <div className={"tool-sensor-action row half-gap"}>
    <span>{t(props.sensor.body.label)}</span>
    <SensorReadingDisplay
      type={props.sensor.body.type}
      value={value}
      mode={props.sensor.body.mode} />
    <button className={"fb-button gray"}
      type={"button"}
      disabled={!isNumber(pin)
        || !props.botOnline || props.arduinoBusy || props.locked}
      onClick={readSensor}>
      {t("Read sensor")}
    </button>
  </div>;
};

interface ToolActionTypes {
  peripheralTypes: PeripheralType[];
  sensorTypes: SensorType[];
}

const TOOL_ACTION_TYPES: Partial<Record<ToolType, ToolActionTypes>> = {
  soil_sensor: {
    peripheralTypes: [],
    sensorTypes: ["soil_moisture"],
  },
  seeder: {
    peripheralTypes: ["vacuum"],
    sensorTypes: [],
  },
  rotary_tool: {
    peripheralTypes: ["rotary_tool"],
    sensorTypes: [],
  },
  watering_nozzle: {
    peripheralTypes: ["water"],
    sensorTypes: [],
  },
};

export const ToolActionRow = (props: ToolActionRowProps) => {
  const toolType = props.mountedTool?.body.type;
  if (!toolType) { return undefined; }
  const actionTypes = TOOL_ACTION_TYPES[toolType];
  if (!actionTypes) { return undefined; }
  const peripherals = props.peripherals.filter(peripheral =>
    actionTypes.peripheralTypes.includes(peripheral.body.type));
  const sensors = props.sensors.filter(sensor =>
    actionTypes.sensorTypes.includes(sensor.body.type)
    || currentSensorMatchesPeripheralTypes(
      sensor, props.peripherals, actionTypes.peripheralTypes));
  const actionCount = peripherals.length + sensors.length;
  if (actionCount == 0) { return undefined; }
  const actionLabel = actionCount > 1
    ? "TOOL ACTIONS"
    : "TOOL ACTION";
  const className = [
    "tool-action-row row grid-exp-1",
    props.className,
  ].filter(Boolean).join(" ");
  return <div className={className}>
    <label>{t(actionLabel)}</label>
    <div className={"tool-action-buttons grid half-gap"}>
      {peripherals.map(peripheral =>
        <PeripheralToggle
          key={peripheral.uuid}
          {...props}
          peripheral={peripheral} />)}
      {sensors.map(sensor =>
        <SensorReadButton
          key={sensor.uuid}
          {...props}
          sensor={sensor} />)}
    </div>
  </div>;
};
