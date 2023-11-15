import React from "react";
import { SpecialStatus } from "farmbot";
import { t } from "../i18next_wrapper";

export interface SaveBtnProps {
  onClick(e: React.MouseEvent): void;
  status: SpecialStatus;
  disabled?: boolean;
  hidden?: boolean;
}

export function SaveBtn(props: SaveBtnProps) {
  const CLASS: Record<SpecialStatus, string> = {
    [SpecialStatus.DIRTY]: "is-dirty",
    [SpecialStatus.SAVING]: "is-saving",
    [SpecialStatus.SAVED]: "is-saved",
  };

  const COLOR: Record<SpecialStatus, string> = {
    [SpecialStatus.DIRTY]: "green",
    [SpecialStatus.SAVING]: "yellow",
    [SpecialStatus.SAVED]: "gray",
  };

  const CAPTION: Record<SpecialStatus, string> = {
    [SpecialStatus.DIRTY]: t("Save"),
    [SpecialStatus.SAVING]: t("Saving"),
    [SpecialStatus.SAVED]: t("Saved"),
  };

  const { status } = props;
  return <button
    className={`fb-button save-btn ${COLOR[status]} ${CLASS[status]}`}
    onClick={props.onClick}
    title={t("save")}
    disabled={props.disabled}
    hidden={!!props.hidden}>
    {CAPTION[status]}
    {status === SpecialStatus.SAVING && <i className={"fa fa-spinner fa-pulse"} />}
    {status === SpecialStatus.SAVED && <i className={"fa fa-check"} />}
  </button>;
}
