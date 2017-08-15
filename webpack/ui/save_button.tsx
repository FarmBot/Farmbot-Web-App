import * as React from "react";
import { t } from "i18next";
import { SaveStatus } from "../resources/tagged_resources";

interface SaveBtnProps {
  /** Callback */
  onClick?: (e: React.MouseEvent<{}>) => void;
  status: SaveStatus | undefined;
  // /** If resource has been edited and not yet saved */
  // isDirty?: boolean;
  // /** If resource is currently being saved */
  // isSaving?: boolean;
  // /** If resource has been saved */
  // isSaved?: boolean;
  /** Optional alternative to "SAVE" */
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
const btnSpinner = <span className="btn-spinner" />;

export function SaveBtn(props: SaveBtnProps) {
  let STATUS_TRANSLATION = {
    [SaveStatus.DIRTY]: "is-dirty",
    [SaveStatus.SAVING]: "is-saving"
  };

  let CAPTION_TRANSLATION = {
    [SaveStatus.DIRTY]: (t(dirtyText || "Save ") + " *"),
    [SaveStatus.SAVING]: (t(savingText || "Saving"))
  };

  let { dirtyText, savingText, savedText } = props;
  let status = "" + (props.status || "");
  let statusClass = STATUS_TRANSLATION[status] || "is-saved";
  let btnColor = props.color || "green";

  return <button
    onClick={props.onClick}
    hidden={!!props.hidden}
    className={`${btnColor} ${statusClass} save-btn fb-button`}
  >
    {(t(savedText || "Saved ") + " ✔")} {isSaving && btnSpinner}

  </button>;
}
