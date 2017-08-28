import * as React from "react";
import { t } from "i18next";
import { SpecialStatus } from "../resources/tagged_resources";

interface SaveBtnProps {
  /** Callback */
  onClick?: (e: React.MouseEvent<{}>) => void;
  /** Defaults to a "saved" status if set to `undefined` */
  status: SpecialStatus | undefined;
  dirtyText?: string;
  /** Optional alternative to "SAVING" */
  savingText?: string;
  /** Optional alternative to "SAVED" */
  savedText?: string;
  /** Optional alternative color to green */
  color?: string;
  /** Optional boolean for whether the button should be hidden or shown */
  hidden?: boolean;
}

/** Animation during saving action */
const spinner = <span className="btn-spinner" />;

export function SaveBtn(props: SaveBtnProps) {
  const STATUS_TRANSLATION = {
    [SpecialStatus.DIRTY]: "is-dirty",
    [SpecialStatus.SAVING]: "is-saving"
  };

  const CAPTIONS = {
    [SpecialStatus.DIRTY]: t((props.dirtyText || "Save ") + " *"),
    [SpecialStatus.SAVING]: t(props.savingText || "Saving")
  };

  const { savedText, onClick, hidden } = props;
  const statusClass = STATUS_TRANSLATION[props.status || ""] || "is-saved";
  const klass = `${props.color || "green"} ${statusClass} save-btn fb-button`;
  const spinnerEl = (props.status === SpecialStatus.SAVING) ?
    spinner : "";

  return <button onClick={onClick} hidden={!!hidden} className={klass} >
    {CAPTIONS["" + props.status] || (t(savedText || "Saved ") + " ✔")} {spinnerEl}
  </button>;
}
