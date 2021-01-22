import React from "react";
import { Actions } from "../constants";
import { tourNames } from "./tours";
import { t } from "../i18next_wrapper";

export interface TourListProps {
  dispatch: Function;
}

export const TourList = (props: TourListProps) =>
  <div className="tour-list">
    {tourNames().map(tour => <div key={tour.name}>
      <label>{tour.description}</label>
      <button className="fb-button green"
        title={t("Start tour")}
        onClick={() =>
          props.dispatch({ type: Actions.START_TOUR, payload: tour.name })}>
        {t("Start tour")}
      </button>
    </div>)}
  </div>;
