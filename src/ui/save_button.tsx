import * as React from "react";
import { t } from "i18next";

interface SaveBtnProps {
  /** Callback */
  onClick?: (e: React.MouseEvent<{}>) => void;
  /** If resource has been edited and not yet saved */
  isDirty?: boolean;
  /** If resource is currently being saved */
  isSaving?: boolean;
  /** If resource has been saved */
  isSaved?: boolean;
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
function BtnSpinner() { return <span className="btn-spinner" />; }

export function SaveBtn(props: SaveBtnProps) {
  let { isDirty, isSaving, isSaved, dirtyText, savingText, savedText } = props;

  /** Determines class for styling based on state of resource */
  let statusClass = "";
  if (isDirty) { statusClass = "is-dirty"; }
  if (isSaving) { statusClass = "is-saving"; }
  if (isSaved) { statusClass = "is-saved"; }

  let btnColor = props.color || "green";

  return <button
    onClick={props.onClick}
    hidden={!!props.hidden}
    className={`${btnColor} save-btn ${statusClass} fb-button`}
  >

    {/** Dirty */}
    {isDirty && !isSaving && (t(dirtyText || "Save ") + " *")}

    {/** Saving */}
    {isSaving && (t(savingText || "Saving"))} {isSaving && <BtnSpinner />}

    {/** Saved */}
    {isSaved && (t(savedText || "Saved ") + " ✔")}

  </button>;
}

