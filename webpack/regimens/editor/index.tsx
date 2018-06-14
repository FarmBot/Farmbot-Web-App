import * as React from "react";
import { EmptyEditor } from "./empty_editor";
import { ActiveEditor } from "./active_editor";
import { RegimenEditorProps } from "./interfaces";
import { isTaggedRegimen } from "../../resources/tagged_resources";

export function RegimenEditor(props: RegimenEditorProps) {
  const { current, dispatch, calendar } = props;
  const regimen = current;
  if (regimen && isTaggedRegimen(regimen) && calendar) {
    return <ActiveEditor
      dispatch={dispatch}
      regimen={regimen}
      calendar={calendar} />;
  } else {
    return <EmptyEditor />;
  }
}
