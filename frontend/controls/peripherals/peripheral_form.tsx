import * as React from "react";
import { PeripheralFormProps } from "./interfaces";
import { sortResourcesById } from "../../util";
import { Row, Col } from "../../ui";
import { DeleteButton } from "../../ui/delete_button";
import { NameInputBox, PinDropdown } from "../pin_form_fields";

export const PeripheralForm = (props: PeripheralFormProps) =>
  <div className="peripheral-form">
    {sortResourcesById(props.peripherals).map(peripheral =>
      <Row key={peripheral.uuid}>
        <Col xs={6}>
          <NameInputBox
            dispatch={props.dispatch}
            value={peripheral.body.label}
            resource={peripheral} />
        </Col>
        <Col xs={4}>
          <PinDropdown
            dispatch={props.dispatch}
            value={peripheral.body.pin}
            resource={peripheral} />
        </Col>
        <Col xs={2}>
          <DeleteButton
            dispatch={props.dispatch}
            uuid={peripheral.uuid} />
        </Col>
      </Row>
    )}
  </div>;
