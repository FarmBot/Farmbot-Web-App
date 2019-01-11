import * as React from "react";
import { RegimenNameInput } from "./regimen_name_input";
import { ActiveEditorProps } from "./interfaces";
import { t } from "i18next";
import { push } from "../../history";
import {
  RegimenItem, CalendarRow, RegimenItemCalendarRow, RegimenProps
} from "../interfaces";
import { TaggedRegimen, VariableDeclaration } from "farmbot";
import { defensiveClone } from "../../util";
import { overwrite, save, destroy } from "../../api/crud";
import { SaveBtn } from "../../ui";
import { CopyButton } from "./copy_button";
import { LocalsList } from "../../sequences/locals_list/locals_list";
import {
  addOrEditVarDeclaration
} from "../../sequences/locals_list/declaration_support";
import {
  AllowedDeclaration
} from "../../sequences/locals_list/locals_list_support";

/**
 * The bottom half of the regimen editor panel (when there's something to
 * actually edit).
 */
export function ActiveEditor(props: ActiveEditorProps) {
  const regimenProps = { regimen: props.regimen, dispatch: props.dispatch };
  return <div className="regimen-editor-content">
    <div className="regimen-editor-tools">
      <RegimenButtonGroup {...regimenProps} />
      <RegimenNameInput {...regimenProps} />
      <LocalsList
        locationDropdownKey={JSON.stringify(props.regimen)}
        declarations={props.regimen.body.body}
        variableData={props.variableData}
        sequenceUuid={props.regimen.uuid}
        resources={props.resources}
        onChange={editRegimenDeclarations(regimenProps)(props.regimen.body.body)}
        allowedDeclarations={AllowedDeclaration.parameter}
        shouldDisplay={props.shouldDisplay} />
      <hr />
    </div>
    <RegimenRows calendar={props.calendar} dispatch={props.dispatch} />
  </div>;
}

export const editRegimenDeclarations = (props: RegimenProps) =>
  (declarations: VariableDeclaration[]) =>
    (declaration: VariableDeclaration) => {
      const copy = defensiveClone(props.regimen);
      copy.body.body = addOrEditVarDeclaration(declarations, declaration);
      props.dispatch(overwrite(props.regimen, copy.body));
    };

const RegimenButtonGroup = (props: RegimenProps) =>
  <div className="button-group">
    <SaveBtn
      status={props.regimen.specialStatus}
      onClick={() => props.dispatch(save(props.regimen.uuid))} />
    <CopyButton regimen={props.regimen} dispatch={props.dispatch} />
    <button className="fb-button red"
      onClick={() => props.dispatch(destroy(props.regimen.uuid))
        .then(() => push("/app/regimens/"))}>
      {t("Delete")}
    </button>
  </div>;

interface RegimenRowsProps {
  calendar: CalendarRow[];
  dispatch: Function;
}

const RegimenRows = (props: RegimenRowsProps) =>
  <div className="regimen">
    {props.calendar.map(regimenDay(props.dispatch))}
  </div>;

const regimenDay = (dispatch: Function) =>
  (group: CalendarRow, dayIndex: number) =>
    <div className="regimen-day" key={dayIndex}>
      <label> {t("Day {{day}}", { day: group.day })} </label>
      {group.items.map(regimenItemRow(dispatch, dayIndex))}
    </div>;

const regimenItemRow = (dispatch: Function, dayIndex: number) =>
  (row: RegimenItemCalendarRow, itemIndex: number) =>
    <div className={`${row.color} regimen-event`}
      key={`${dayIndex}.${itemIndex}`}>
      <span className="regimen-event-title">{row.name}</span>
      <span className="regimen-event-time">{row.hhmm}</span>
      <i className="fa fa-trash regimen-control" onClick={() =>
        dispatch(removeRegimenItem(row.item, row.regimen))} />
    </div>;

const removeRegimenItem = (item: RegimenItem, r: TaggedRegimen) => {
  const copy = defensiveClone(r);
  copy.body.regimen_items = r.body.regimen_items.filter(x => x !== item);
  return overwrite(r, copy.body);
};
