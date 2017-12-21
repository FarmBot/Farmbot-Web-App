import * as React from "react";
import { Row, Col } from "../ui/index";
import { ToggleButton } from "./toggle_button";

export interface KeyValRowProps {
  label: string;
  labelPlaceholder: string;
  value: string;
  valuePlaceholder: string;
  onClick(): void;
  disabled: boolean;
  toggleValue?: number | undefined;
}

/** A row containing two textboxes and a delete button. Useful for maintaining
 * lists of things (peripherals, feeds, tools etc). */
export function KeyValShowRow(p: KeyValRowProps) {
  const { label, value, toggleValue, disabled, onClick } = p;
  return <Row>
    <Col xs={4}>
      <label>{label}</label>
    </Col>
    <Col xs={4}>
      <p>{value}</p>
    </Col>
    <Col xs={4}>
      <ToggleButton
        toggleValue={toggleValue}
        toggleAction={onClick}
        customText={{ textFalse: "off", textTrue: "on" }}
        disabled={disabled} />
    </Col>
  </Row>;
}
