import * as React from "react";
import { RegimenNameInput } from "./regimen_name_input";
import { ActiveEditorProps } from "./interfaces";
import { t } from "i18next";
import { RegimenItem } from "../interfaces";
import { TaggedRegimen } from "../../resources/tagged_resources";
import { defensiveClone } from "../../util";
import { overwrite, save, destroy } from "../../api/crud";
import { SaveBtn } from "../../ui";
import { CopyButton } from "./copy_button";

/**
 * The bottom half of the regimen editor panel (when there's something to
 * actually edit).
 */
export function ActiveEditor(props: ActiveEditorProps) {
  return <div className="regimen-editor-content">
    <div className="regimen-editor-tools">
      <div className="button-group">
        <SaveBtn
          status={props.regimen.specialStatus}
          onClick={() => props.dispatch(save(props.regimen.uuid))} />
        <CopyButton regimen={props.regimen} dispatch={props.dispatch} />
        <button className="fb-button red"
          onClick={() => props.dispatch(destroy(props.regimen.uuid))}>
          {t("Delete")}
        </button>
      </div>
      <RegimenNameInput regimen={props.regimen} dispatch={props.dispatch} />
      <hr />
    </div>
    <div className="regimen">
      {props.calendar.map(function (group, index1) {
        return <div className="regimen-day" key={index1}>
          <label> {t("Day {{day}}", { day: group.day })} </label>
          {group.items.map(function (row, index2) {
            const { item, regimen } = row;
            const click = () => props.dispatch(removeRegimenItem(item, regimen));
            const klass = `${row.color} regimen-event`;
            return <div className={klass} key={`${index1}.${index2}`}>
              <span className="regimen-event-title">{row.name}</span>
              <span className="regimen-event-time">{row.hhmm}</span>
              <i className="fa fa-trash regimen-control" onClick={click} />
            </div>;
          })}
        </div>;
      })}
    </div>
  </div>;
}

function removeRegimenItem(item: RegimenItem, r: TaggedRegimen) {
  const copy = defensiveClone(r);
  copy.body.regimen_items = r.body.regimen_items.filter(x => x !== item);
  return overwrite(r, copy.body);
}
