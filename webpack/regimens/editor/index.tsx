import * as React from "react";
import { CopyButton } from "./copy_button";
import { EmptyEditor } from "./empty_editor";
import { ActiveEditor } from "./active_editor";
import { RegimenEditorWidgetProps, DeleteButtonProps } from "./interfaces";
import { ToolTip, SaveBtn } from "../../ui/index";
import { saveRegimen, deleteRegimen } from "../actions";
import { RegimenProps, MiddleSectionProps } from "../interfaces";
import { isTaggedRegimen } from "../../resources/tagged_resources";
import { t } from "i18next";
import { ToolTips } from "../../constants";

function MiddleSection({ regimen, dispatch, calendar }: MiddleSectionProps) {
  if (regimen && isTaggedRegimen(regimen) && calendar) {
    return <ActiveEditor
      dispatch={dispatch}
      regimen={regimen}
      calendar={calendar} />;
  } else {
    return <EmptyEditor />;
  }
}

function save({ regimen, dispatch }: RegimenProps) {
  if (regimen) {
    return () => {
      dispatch(saveRegimen(regimen.uuid));
    };
  } else { throw new Error("Tried to save regimen, but there wasn't one."); }
}

function remove({ regimen, dispatch }: DeleteButtonProps) {
  if (regimen) {
    return () =>
      regimen && dispatch(deleteRegimen(regimen.uuid));
  } else {
    // Technically unreachable, but I'll keep TS happy...
    throw new Error("Tried to delete non-existent regimen");
  }
}

export function RegimenEditorWidget({ current, dispatch, auth, calendar }:
  RegimenEditorWidgetProps) {
  if (auth) {
    const regimen = current;
    const baseUrl = (auth.token && auth.token.unencoded.iss) ||
      "CANT_FETCH_TOKEN_ISS";

    return <div className="regimen-editor-panel">
      <h3>
        <i>{t("Regimen Editor")}</i>
      </h3>
      <ToolTip helpText={ToolTips.REGIMEN_EDITOR} />
      <div className="button-group">
        {regimen && (
          <SaveBtn
            status={regimen.specialStatus}
            onClick={save({ dispatch, regimen })} />
        )}

        <CopyButton regimen={regimen} dispatch={dispatch} />

        {regimen && (
          <button className="fb-button red"
            onClick={remove({ dispatch, regimen, baseUrl })}>
            {t("Delete")}
          </button>
        )}
      </div>
      <MiddleSection
        regimen={regimen}
        dispatch={dispatch}
        calendar={calendar} />
    </div >;
  } else {
    throw new Error("Must log in first");
  }
}
