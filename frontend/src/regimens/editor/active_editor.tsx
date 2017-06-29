import * as React from "react";
import { RegimenNameInput } from "./regimen_name_input";
import { ActiveEditorProps } from "./interfaces";
import { t } from "i18next";
import { RegimenItem, RegimenItemCalendarRow } from "../interfaces";
import { TaggedRegimen } from "../../resources/tagged_resources";
import { defensiveClone } from "../../util";
import { overwrite } from "../../api/crud";
/** The bottom half of the regimen editor panel (when there's something to
    actually edit). */
export function ActiveEditor(props: ActiveEditorProps) {
  return <div>
    <RegimenNameInput regimen={props.regimen} dispatch={props.dispatch} />
    <hr />
    {props.calendar.map(function (group, index1) {
      return <div className="regimen-day" key={index1}>
        <label> {t("Day {{day}}", { day: group.day })} </label>
        {group.items.map(function (row, index2) {
          let { item, regimen } = row;
          let click = () => props.dispatch(removeRegimenItem(item, regimen));
          let klass = `${row.color} block-header regimen-event`
          return <div className={klass} key={`${index1}.${index2}`}>
            <span className="regimen-event-title">{row.name}</span>
            <span className="regimen-event-time">{row.hhmm}</span>
            <i className="fa fa-trash regimen-control" onClick={click} />
          </div>;
        })}
      </div>;
    })}
  </div>;
}

function removeRegimenItem(item: RegimenItem, r: TaggedRegimen) {
  let copy = defensiveClone(r);
  copy.body.regimen_items = r.body.regimen_items.filter(x => x !== item);
  return overwrite(r, copy.body);
}
