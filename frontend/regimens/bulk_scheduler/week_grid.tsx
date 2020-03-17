import * as React from "react";
import { WeekRow } from "./week_row";
import { WeekGridProps } from "./interfaces";
import { pushWeek, popWeek, deselectDays, selectDays } from "./actions";
import { Row, Col } from "../../ui/index";
import { t } from "../../i18next_wrapper";

export function WeekGrid({ weeks, dispatch }: WeekGridProps) {
  return <div className={"week-grid"}>
    <Row>
      <Col xs={12}>
        <label className="regimen-days-label">
          {t("Days")}
        </label>
        {weeks.map(function (week, i) {
          return <WeekRow key={i} index={i} week={week}
            dispatch={dispatch} />;
        })}
      </Col>
    </Row>
    <Row>
      <Col xs={12}>
        <div className="week-grid-meta-buttons">
          <div className={"weed-grid-plus-minus-buttons"}>
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
          </div>
          <div className={"weed-grid-bulk-select-buttons"}>
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
          </div>
        </div>
      </Col>
    </Row>
  </div>;
}
