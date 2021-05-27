import React from "react";
import { t } from "../../i18next_wrapper";
import { tourPath } from ".";
import { push } from "../../history";
import { TOURS } from "./data";
import { Actions } from "../../constants";
import { TourListProps } from "./interfaces";

export const TourList = (props: TourListProps) =>
  <div className="tour-list">
    {Object.entries(TOURS()).map(([tourSlug, tour]) => {
      const firstStep = tour.steps[0];
      const click = () => {
        props.dispatch({ type: Actions.SET_TOUR, payload: tourSlug });
        props.dispatch({ type: Actions.SET_TOUR_STEP, payload: firstStep.slug });
        push(tourPath(firstStep.url, tourSlug, firstStep.slug));
      };
      return <div key={tour.title}>
        <label>{tour.title}</label>
        <button className="fb-button green"
          title={t("Start tour")}
          onClick={click}>
          {t("Start tour")}
        </button>
      </div>;
    })}
  </div>;
