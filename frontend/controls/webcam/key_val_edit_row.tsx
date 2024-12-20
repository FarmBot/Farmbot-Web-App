import React from "react";
import { Row } from "../../ui";
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
  return <Row className="key-value-edit-row">
    <input type="text"
      name="label"
      placeholder={p.labelPlaceholder}
      value={p.label}
      onChange={p.onLabelChange} />
    <input type={p.valueType}
      name="value"
      value={p.value}
      placeholder={p.valuePlaceholder}
      onChange={p.onValueChange} />
    <button
      className="red fb-button"
      title={t("Delete")}
      onClick={p.onClick}>
      <i className="fa fa-times" />
    </button>
  </Row>;
}
