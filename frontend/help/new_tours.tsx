import React from "react";
import { Actions, TourContent } from "../constants";
import { push } from "../history";
import { t } from "../i18next_wrapper";
import { HelpState } from "./reducer";

export interface TourStepContainerProps {
  dispatch: Function;
  helpState: HelpState;
}

interface NewTourStep {
  slug: string;
  title: string;
  content: string;
  beacon: string | undefined;
  url: string | undefined;
}

interface NewTour {
  title: string;
  steps: NewTourStep[];
}

const TOURS = (): Record<string, NewTour> => ({
  gettingStarted: {
    title: t("Getting Started"),
    steps: [
      {
        slug: "intro",
        title: t("Getting Started"),
        content: TourContent.GETTING_STARTED,
        beacon: undefined,
        url: undefined,
      },
      {
        slug: "plants",
        title: t("Plants"),
        content: TourContent.PLANTS_PANEL,
        beacon: "plants",
        url: "/app/designer/plants",
      },
      {
        slug: "groups",
        title: t("Groups"),
        content: TourContent.GROUPS_PANEL,
        beacon: "groups",
        url: "/app/designer/groups",
      },
      {
        slug: "savedGardens",
        title: t("Gardens"),
        content: TourContent.SAVED_GARDENS_PANEL,
        beacon: "gardens",
        url: "/app/designer/gardens",
      },
      {
        slug: "sequences",
        title: t("Sequences"),
        content: TourContent.SEQUENCES_PANEL,
        beacon: "sequences",
        url: "/app/designer/sequences",
      },
      {
        slug: "regimens",
        title: t("Regimens"),
        content: TourContent.REGIMENS_PANEL,
        beacon: "regimens",
        url: "/app/designer/regimens",
      },
      {
        slug: "farmEvents",
        title: t("Events"),
        content: TourContent.FARM_EVENTS_PANEL,
        beacon: "events",
        url: "/app/designer/events",
      },
      {
        slug: "points",
        title: t("Points"),
        content: TourContent.POINTS_PANEL,
        beacon: "points",
        url: "/app/designer/points",
      },
      {
        slug: "weeds",
        title: t("Weeds"),
        content: TourContent.WEEDS_PANEL,
        beacon: "weeds",
        url: "/app/designer/weeds",
      },
      {
        slug: "controls",
        title: t("Controls"),
        content: TourContent.CONTROLS_PANEL,
        beacon: "controls",
        url: "/app/designer/controls",
      },
      {
        slug: "photos",
        title: t("Photos"),
        content: TourContent.PHOTOS_PANEL,
        beacon: "photos",
        url: "/app/designer/photos",
      },
      {
        slug: "tools",
        title: t("Tools"),
        content: TourContent.TOOLS_PANEL,
        beacon: "tools",
        url: "/app/designer/tools",
      },
      {
        slug: "messages",
        title: t("Messages"),
        content: TourContent.MESSAGES_PANEL,
        beacon: "messages",
        url: "/app/designer/messages",
      },
      {
        slug: "help",
        title: t("Help"),
        content: TourContent.HELP_PANEL,
        beacon: "help",
        url: "/app/designer/help",
      },
      {
        slug: "settings",
        title: t("Settings"),
        content: TourContent.SETTINGS_PANEL,
        beacon: "settings",
        url: "/app/designer/settings",
      },

    ],
  },
});

export const TourStepContainer = (props: TourStepContainerProps) => {
  const { currentNewTour, currentNewTourStep } = props.helpState;
  const updateTourState =
    (tour: string | undefined, tourStep: string | undefined) => {
      props.dispatch({ type: Actions.SET_TOUR, payload: tour });
      props.dispatch({ type: Actions.SET_TOUR_STEP, payload: tourStep });
      if (tour) {
        const currentStep = TOURS()[tour].steps.filter(step =>
          step.slug == tourStep)[0];
        const tourQuery = `?tour=${tour}?tourStep=${tourStep}`;
        push(`${currentStep.url || location.pathname}${tourQuery}`);
      } else {
        push(location.pathname);
      }
    };
  if (!getUrlQuery("tour") && currentNewTour && currentNewTourStep) {
    updateTourState(currentNewTour, currentNewTourStep);
  }
  const currentTourSlug = getUrlQuery("tour");
  const currentStepSlug = getUrlQuery("tourStep");
  if (currentTourSlug && currentStepSlug
    && (!currentNewTour || !currentNewTourStep)) {
    updateTourState(currentTourSlug, currentStepSlug);

  }
  if (!currentTourSlug || !currentStepSlug) {
    return <div className={"tour-closed"} />;
  }
  const nextStep = getNextTourStep();
  const currentStep = TOURS()[currentTourSlug].steps.filter(step =>
    step.slug == currentStepSlug)[0];
  const firstStepBeacon = TOURS()[currentTourSlug].steps[0].slug == currentStepSlug
    ? "beacon"
    : "";
  return <div className={"toast-container"}>
    <div className={"tour-toast toast dark-blue active"}>
      <h4 className={"toast-title"}>{currentStep?.title}</h4>
      <div className={"toast-message"}>
        {t(currentStep?.content)}
      </div>
      <div className={"toast-loader"}>
        {nextStep &&
          <i className={`fa fa-forward next ${firstStepBeacon}`}
            title={t("next")}
            onClick={() => updateTourState(currentTourSlug, nextStep.slug)} />}
        <i className={"fa fa-times exit"}
          title={t("quit tour")}
          onClick={() => updateTourState(undefined, undefined)} />
      </div>
    </div>
  </div>;
};

export const getUrlQuery = (key: string): string | undefined =>
  location.search
    .split(`?${key}=`).filter(x => x).pop()?.split("?")[0].split("#")[0];

export const tourStepBeacon = (slug: string) =>
  getUrlQuery("tourStep") == slug
    ? "beacon"
    : "";

export const getNextTourStep = (helpState?: HelpState) => {
  const currentTourSlug = getUrlQuery("tour") || helpState?.currentNewTour;
  const currentStepSlug = getUrlQuery("tourStep") || helpState?.currentNewTourStep;
  if (!currentTourSlug || !currentStepSlug) {
    return undefined;
  }
  const currentTour = TOURS()[currentTourSlug];
  const tourStepSlugs = currentTour.steps.map(step => step.slug);
  const nextStepSlug = tourStepSlugs[tourStepSlugs.indexOf(currentStepSlug) + 1];
  return currentTour.steps.filter(step => step.slug == nextStepSlug)[0];
};
