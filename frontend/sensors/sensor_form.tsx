import React from "react";
import { SensorFormProps } from "./interfaces";
import { sortResourcesById } from "../util";
import { Row } from "../ui";
import { DeleteButton } from "../ui/delete_button";
import {
  NameInputBox, PinDropdown, ModeDropdown,
} from "../controls/pin_form_fields";

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
        <DeleteButton
          dispatch={props.dispatch}
          uuid={sensor.uuid} />
      </Row>)}
  </div>;
