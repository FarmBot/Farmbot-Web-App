import * as React from "react";

import { Widget, WidgetBody, WidgetHeader } from "../ui";
import { ToolTips, Actions } from "../constants";
import { tourNames } from "./tours";
import { t } from "../i18next_wrapper";

export const TourList = ({ dispatch }: { dispatch: Function }) =>
  <div className="tour-list">
    {tourNames().map(tour => <div key={tour.name}>
      <label>{tour.description}</label>
      <button className="fb-button green"
        onClick={() =>
          dispatch({ type: Actions.START_TOUR, payload: tour.name })}>
        {t("Start tour")}
      </button>
    </div>)}
  </div>;

export const ToursWidget = ({ dispatch }: { dispatch: Function }) =>
  <Widget className="tours-widget">
    <WidgetHeader helpText={ToolTips.TOURS} title={t("Tours")} />
    <WidgetBody>
      {t("What do you need help with?")}
      <TourList dispatch={dispatch} />
    </WidgetBody>
  </Widget>;
