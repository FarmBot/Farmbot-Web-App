import * as React from "react";
import { Row, Col } from "../ui/index";
import { KeyValRowProps } from "./key_val_show_row";

interface Props extends KeyValRowProps {
  onLabelChange(e: React.ChangeEvent<HTMLInputElement>): void;
  onValueChange(e: React.ChangeEvent<HTMLInputElement>): void;
  valueType: "number" | "string";
}

/** A row containing two textboxes and a delete button. Useful for maintaining
 * lists of things (peripherals, feeds, tools etc). */
export function KeyValEditRow(p: Props) {
  return <Row>
    <Col xs={6}>
      <input type="text"
        placeholder={p.labelPlaceholder}
        value={p.label}
        onChange={p.onLabelChange} />
    </Col>
    <Col xs={4}>
      <input type={p.valueType}
        value={p.value}
        placeholder={p.valuePlaceholder}
        onChange={p.onValueChange} />
    </Col>
    <Col xs={2}>
      <button
        className="red fb-button"
        onClick={p.onClick}>
        <i className="fa fa-minus" />
      </button>
    </Col>
  </Row>;
}
