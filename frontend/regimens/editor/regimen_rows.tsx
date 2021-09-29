import React from "react";
import { CalendarRow, RegimenItemCalendarRow } from "../interfaces";
import { TaggedRegimen } from "farmbot";
import { defensiveClone } from "../../util";
import { overwrite } from "../../api/crud";
import { t } from "../../i18next_wrapper";
import { reduceVariables } from "../../sequences/locals_list/variable_support";
import { determineDropdown, withPrefix } from "../../resources/sequence_meta";
import { ResourceIndex } from "../../resources/interfaces";
import { RegimenRowsProps, DisplayVarValueProps } from "./interfaces";
import { RegimenItem } from "farmbot/dist/resources/api_resources";

/** Make room for the regimen header variable form when necessary. */
const regimenSectionHeight =
  (regimen: TaggedRegimen, varsCollapsed: boolean) => {
    let subHeight = 200;
    const variables = regimen.body.body.length > 0;
    if (variables) { subHeight = 500; }
    if (varsCollapsed) { subHeight = 300; }
    const variablesDiv = document.getElementById("regimen-editor-tools");
    if (variablesDiv) { subHeight = 200 + variablesDiv.offsetHeight; }
    return `calc(100vh - ${subHeight}px)`;
  };

export const RegimenRows = (props: RegimenRowsProps) =>
  <div className="regimen" style={{
    height: regimenSectionHeight(props.regimen, props.varsCollapsed)
  }}>
    {props.calendar.map(regimenDay(props.dispatch, props.resources))}
  </div>;

const regimenDay = (dispatch: Function, resources: ResourceIndex) =>
  (group: CalendarRow, dayIndex: number) =>
    <div className="regimen-day" key={dayIndex}>
      <label> {t("Day {{day}}", { day: group.day })} </label>
      {group.items.map(regimenItemRow(dispatch, resources, dayIndex))}
    </div>;

const regimenItemRow = (
  dispatch: Function, resources: ResourceIndex, dayIndex: number,
) =>
  (row: RegimenItemCalendarRow, itemIndex: number) =>
    <div className={`${row.color} regimen-event`}
      key={`${dayIndex}.${itemIndex}`}>
      <span className="regimen-event-title">{row.name}</span>
      <span className="regimen-event-time">{row.hhmm}</span>
      <DisplayVarValue row={row} resources={resources} />
      <i className="fa fa-trash regimen-control" onClick={() =>
        dispatch(removeRegimenItem(row.item, row.regimen))} />
    </div>;

const removeRegimenItem = (item: RegimenItem, r: TaggedRegimen) => {
  const copy = defensiveClone(r);
  copy.body.regimen_items = r.body.regimen_items.filter(x => x !== item);
  return overwrite(r, copy.body);
};

const DisplayVarValue = (props: DisplayVarValueProps) => {
  const { variables, regimen } = props.row;
  return <div className={"regimen-item-variables"}>
    {variables.map(variable => {
      if (variable) {
        const variableNode = reduceVariables(regimen.body.body)[variable];
        if (variableNode) {
          return <span key={variable}
            className="regimen-event-variable">
            {withPrefix(variable,
              determineDropdown(variableNode, props.resources).label)}
          </span>;
        }
      }
      return <span key={"no-variable"} className={"no-regimen-variable"} />;
    })}
  </div>;
};
