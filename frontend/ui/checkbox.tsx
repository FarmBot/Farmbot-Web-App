import React from "react";
import { t } from "../i18next_wrapper";

export interface CheckboxProps {
  onChange(): void;
  checked: boolean;
  title: string;
  disabled?: boolean;
  partial?: boolean;
  onClick?: (e: React.FormEvent) => void;
  customDisabledText?: string;
  color?: string;
}

export const Checkbox = (props: CheckboxProps) =>
  <div
    className={["fb-checkbox",
      props.partial ? "partial" : "",
      props.disabled ? "disabled" : "",
    ].join(" ")}
    title={props.disabled ? props.customDisabledText ?? t("incompatible") : ""}
    onClick={props.onClick}>
    <input type="checkbox"
      className={props.color ?? ""}
      title={props.title}
      onChange={props.onChange}
      checked={props.checked} />
  </div>;
