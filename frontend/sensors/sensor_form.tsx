import React from "react";
import { SensorFormProps } from "./interfaces";
import { sortResourcesById } from "../util";
import { FBSelect, Row } from "../ui";
import { DeleteButton } from "../ui/delete_button";
import { edit } from "../api/crud";
import { t } from "../i18next_wrapper";
import { TaggedSensor } from "farmbot";
import { SensorType } from "farmbot/dist/resources/api_resources";
import {
  NameInputBox, PinDropdown, ModeDropdown,
} from "../controls/pin_form_fields";

export const SENSOR_TYPE_CHOICES = (): {
  label: string;
  value: SensorType;
}[] => [
  { label: t("Soil Moisture"), value: "soil_moisture" },
  { label: t("Tool Verification"), value: "tool_verification" },
  { label: t("Current"), value: "current" },
  { label: t("None"), value: "none" },
];

interface SensorTypeDropdownProps {
  dispatch: Function;
  sensor: TaggedSensor;
}

export const SensorTypeDropdown = (props: SensorTypeDropdownProps) => {
  const choices = SENSOR_TYPE_CHOICES();
  return <FBSelect
    list={choices}
    selectedItem={choices.find(choice =>
      choice.value == props.sensor.body.type)}
    onChange={choice => props.dispatch(edit(props.sensor, {
      type: choice.value as SensorType,
    }))} />;
};

export const SensorForm = (props: SensorFormProps) =>
  <div className="grid">
    {sortResourcesById(props.sensors).map(sensor =>
      <Row key={sensor.uuid} className="sensor-form-grid">
        <NameInputBox
          dispatch={props.dispatch}
          value={sensor.body.label}
          resource={sensor} />
        <PinDropdown
          dispatch={props.dispatch}
          value={sensor.body.pin}
          resource={sensor} />
        <ModeDropdown
          dispatch={props.dispatch}
          value={sensor.body.mode}
          resource={sensor} />
        <SensorTypeDropdown
          dispatch={props.dispatch}
          sensor={sensor} />
        <DeleteButton
          dispatch={props.dispatch}
          uuid={sensor.uuid} />
      </Row>)}
  </div>;
