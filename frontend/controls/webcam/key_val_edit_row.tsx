import React from "react";
import { Row, Col } from "../../ui";
import { t } from "../../i18next_wrapper";

export interface KeyValEditRowProps {
  label: string;
  labelPlaceholder: string;
  value: string;
  valuePlaceholder: string;
  onClick(): void;
  disabled: boolean;
  toggleValue?: number | undefined;
  title?: string;
  onLabelChange(e: React.ChangeEvent<HTMLInputElement>): void;
  onValueChange(e: React.ChangeEvent<HTMLInputElement>): void;
  valueType: "number" | "string";
}

/** A row containing two textboxes and a delete button. Useful for maintaining
 * lists of things (peripherals, feeds, tools etc). */
export function KeyValEditRow(p: KeyValEditRowProps) {
  return <Row>
    <Col xs={6}>
      <input type="text"
        name="label"
        placeholder={p.labelPlaceholder}
        value={p.label}
        onChange={p.onLabelChange} />
    </Col>
    <Col xs={4}>
      <input type={p.valueType}
        name="value"
        value={p.value}
        placeholder={p.valuePlaceholder}
        onChange={p.onValueChange} />
    </Col>
    <Col xs={2}>
      <button
        className="red fb-button del-button"
        title={t("Delete")}
        onClick={p.onClick}>
        <i className="fa fa-times" />
      </button>
    </Col>
  </Row>;
}
