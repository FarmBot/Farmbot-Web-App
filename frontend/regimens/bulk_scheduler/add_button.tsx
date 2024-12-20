import React from "react";
import { AddButtonProps } from "./interfaces";
import { t } from "../../i18next_wrapper";

export function AddButton({ active, onClick: click }: AddButtonProps) {
  if (!active) { return <div className={"no-add-button"} />; }
  return <button
    className="fb-button green bulk-scheduler-add"
    title={t("add")}
    onClick={click}>
    <i className="fa fa-plus" />
  </button>;
}
