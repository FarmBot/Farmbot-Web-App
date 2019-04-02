import * as React from "react";
import { ActiveEditor } from "./active_editor";
import { RegimenEditorProps } from "./interfaces";
import { isTaggedRegimen } from "../../resources/tagged_resources";
import {
  EmptyStateWrapper, EmptyStateGraphic
} from "../../ui/empty_state_wrapper";
import { Content } from "../../constants";
import { t } from "../../i18next_wrapper";


export function RegimenEditor(props: RegimenEditorProps) {
  const { current, dispatch, calendar } = props;
  const regimen = current;
  return <EmptyStateWrapper
    notEmpty={regimen && isTaggedRegimen(regimen) && calendar}
    graphic={EmptyStateGraphic.regimens}
    title={t("No Regimen selected.")}
    text={Content.NO_REGIMEN_SELECTED}>
    {regimen && <ActiveEditor
      dispatch={dispatch}
      regimen={regimen}
      calendar={calendar}
      resources={props.resources}
      variableData={props.variableData}
      shouldDisplay={props.shouldDisplay} />}
  </EmptyStateWrapper>;
}
