import React from "react";
import { CalendarRow, RegimenItemCalendarRow } from "../interfaces";
import { TaggedRegimen } from "farmbot";
import { defensiveClone, urlFriendly } from "../../util";
import { overwrite } from "../../api/crud";
import { t } from "../../i18next_wrapper";
import { reduceVariables } from "../../sequences/locals_list/variable_support";
import { determineDropdown, withPrefix } from "../../resources/sequence_meta";
import { ResourceIndex } from "../../resources/interfaces";
import { RegimenRowsProps, DisplayVarValueProps } from "./interfaces";
import { RegimenItem } from "farmbot/dist/resources/api_resources";
import { Link } from "../../link";
import {
  setActiveSequenceByName,
} from "../../sequences/set_active_sequence_by_name";
import { Path } from "../../internal_urls";
import {
  determineVariableType, VariableIcon,
} from "../../sequences/locals_list/new_variable";

export const RegimenRows = (props: RegimenRowsProps) =>
  <div className={"regimen"}>
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
      <div className={"regimen-event-titlebar"}>
        <span className={"regimen-event-title"}>
          {row.sequenceName}
          <Link to={Path.sequences(urlFriendly(row.sequenceName))}
            onClick={setActiveSequenceByName}>
            <i className="fa fa-external-link" />
          </Link>
        </span>
        <span className="regimen-event-time">{row.hhmm}</span>
        <i className="fa fa-trash regimen-control" onClick={() =>
          dispatch(removeRegimenItem(row.item, row.regimen))} />
      </div>
      <DisplayVarValue row={row} resources={resources} />
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
            <VariableIcon variableType={determineVariableType(variableNode)} />
            {withPrefix(variable,
              determineDropdown(variableNode, props.resources).label)}
          </span>;
        }
      }
      return <span key={"no-variable-" + variable}
        className={"no-regimen-variable"} />;
    })}
  </div>;
};
