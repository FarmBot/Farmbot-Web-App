import * as React from "react";
import { SensorFormProps } from "./interfaces";
import { sortResourcesById } from "../../util";
import { Row, Col } from "../../ui";
import {
  NameInputBox, PinDropdown, ModeDropdown, DeleteButton
} from "../pin_form_fields";

export const SensorForm = (props: SensorFormProps) =>
  <div className="sensor-form">
    {sortResourcesById(props.sensors).map(sensor =>
      <Row key={sensor.uuid}>
        <Col xs={4}>
          <NameInputBox
            dispatch={props.dispatch}
            value={sensor.body.label}
            resource={sensor} />
        </Col>
        <Col xs={3}>
          <PinDropdown
            dispatch={props.dispatch}
            value={sensor.body.pin}
            resource={sensor} />
        </Col>
        <Col xs={3}>
          <ModeDropdown
            dispatch={props.dispatch}
            value={sensor.body.mode}
            resource={sensor} />
        </Col>
        <Col xs={2}>
          <DeleteButton
            dispatch={props.dispatch}
            uuid={sensor.uuid} />
        </Col>
      </Row>)}
  </div>;
