import React from "react";
import { WeekRow } from "./week_row";
import { WeekGridProps } from "./interfaces";
import { pushWeek, popWeek, deselectDays, selectDays } from "./actions";
import { Row } from "../../ui";
import { t } from "../../i18next_wrapper";

export function WeekGrid({ weeks, dispatch }: WeekGridProps) {
  return <div className="week-grid grid">
    <label className="regimen-days-label">
      {t("Days")}
    </label>
    <div>
      {weeks.map(function (week, i) {
        return <WeekRow key={i} index={i} week={week}
          dispatch={dispatch} />;
      })}
    </div>
    <Row className="week-grid-meta-buttons">
      <button
        className="green widget-control fb-button"
        title={t("add week")}
        onClick={() => dispatch(pushWeek())}>
        <i className="fa fa-plus" /> {t("Week")}
      </button>
      <button
        className="red widget-control fb-button"
        title={t("remove week")}
        onClick={() => dispatch(popWeek())}>
        <i className="fa fa-minus" /> {t("Week")}
      </button>
      <button
        className="gray widget-control fb-button"
        title={t("deselect all days")}
        onClick={() => dispatch(deselectDays())}>
        {t("Deselect all")}
      </button>
      <button
        className="gray widget-control fb-button"
        title={t("select all days")}
        onClick={() => dispatch(selectDays())}>
        {t("Select all")}
      </button>
    </Row>
  </div>;
}
