import * as React from "react";
import { Row, Col } from "../ui/index";
import { ToggleButton } from "./toggle_button";

export interface KeyValRowProps {
  label: string;
  value: string;
  onClick(): void;
  disabled: boolean;
}

/** A row containing two textboxes and a delete button. Useful for maintaining
 * lists of things (peripherals, feeds, tools etc). */
export function KeyValShowRow(p: KeyValRowProps) {
  const { label, value, disabled, onClick } = p;
  return <Row>
    <Col xs={4}>
      <label>{label}</label>
    </Col>
    <Col xs={4}>
      <p>{label}</p>
    </Col>
    <Col xs={4}>
      <ToggleButton
        toggleValue={value}
        toggleAction={onClick}
        noYes={false}
        disabled={disabled} />
    </Col>
  </Row>;
}
