import React from "react";
import { PeripheralFormProps } from "./interfaces";
import { sortResourcesById } from "../../util";
import { Row } from "../../ui";
import { DeleteButton } from "../../ui/delete_button";
import { NameInputBox, PinDropdown, ModeDropdown } from "../pin_form_fields";

export const PeripheralForm = (props: PeripheralFormProps) =>
  <div className="peripheral-form grid">
    {sortResourcesById(props.peripherals).map(peripheral =>
      <Row key={peripheral.uuid} className="peripheral-edit-grid">
        <NameInputBox
          dispatch={props.dispatch}
          value={peripheral.body.label}
          resource={peripheral} />
        <PinDropdown
          dispatch={props.dispatch}
          value={peripheral.body.pin}
          resource={peripheral} />
        <ModeDropdown
          dispatch={props.dispatch}
          value={peripheral.body.mode}
          resource={peripheral} />
        <DeleteButton
          dispatch={props.dispatch}
          uuid={peripheral.uuid} />
      </Row>)}
  </div>;
