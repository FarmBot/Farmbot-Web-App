import React from "react";
import { WeekRowProps, DayProps, DAYS } from "./interfaces";
import { toggleDay } from "./actions";
import { t } from "../../i18next_wrapper";

export function WeekRow({ index, dispatch, week }: WeekRowProps) {
  return <div className="week-row">
    <label className="week-label">{t("Week")} {index + 1}</label>
    {DAYS.map(function (day, i) {
      const id = `${index}-${day}`;
      return <Day day={i + 1}
        week={index}
        dispatch={dispatch}
        id={id}
        key={id}
        active={week.days[day]} />;
    })}
  </div>;
}

const select = (dispatch: Function, day: number, week: number) => () =>
  dispatch(toggleDay({ day, week }));

function Day({ day, id, dispatch, week, active }: DayProps) {
  return <div className="day-selector-wrapper">
    <input type="checkbox"
      id={id}
      className="day"
      name="day"
      onClick={select(dispatch, day, week)}
      checked={active}
      readOnly={true} />
    <label className="day-label left-most" htmlFor={id}>
      {(week * 7) + day}
    </label>
  </div>;
}
