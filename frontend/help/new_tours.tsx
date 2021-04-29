import { round } from "lodash";
import React from "react";
import { Actions, TourContent } from "../constants";
import { push } from "../history";
import { t } from "../i18next_wrapper";
import { getUrlQuery } from "../util";
import { HelpState } from "./reducer";

export interface TourStepContainerProps {
  dispatch: Function;
  helpState: HelpState;
}

interface NewTourStep {
  slug: string;
  title: string;
  content: string;
  beacons: string[] | undefined;
  url: string | undefined;
  extraContent?: JSX.Element;
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
        extraContent: <div className={"extra-content"}>
          {t("Click")}
          <i className={"fa fa-forward"} />
          {t("to get started")}
        </div>,
        beacons: undefined,
        url: undefined,
      },
      {
        slug: "plants",
        title: t("Plants"),
        content: TourContent.PLANTS_PANEL,
        beacons: ["plants", "plant-inventory"],
        url: "/app/designer/plants",
      },
      {
        slug: "groups",
        title: t("Groups"),
        content: TourContent.GROUPS_PANEL,
        beacons: ["groups"],
        url: "/app/designer/groups",
      },
      {
        slug: "sequences",
        title: t("Sequences"),
        content: TourContent.SEQUENCES_PANEL,
        beacons: ["sequences", "designer-sequence-list"],
        url: "/app/designer/sequences",
      },
      {
        slug: "regimens",
        title: t("Regimens"),
        content: TourContent.REGIMENS_PANEL,
        beacons: ["regimens", "designer-regimen-list"],
        url: "/app/designer/regimens",
      },
      {
        slug: "savedGardens",
        title: t("Gardens"),
        content: TourContent.SAVED_GARDENS_PANEL,
        beacons: ["gardens", "saved-garden"],
        url: "/app/designer/gardens",
      },
      {
        slug: "farmEvents",
        title: t("Events"),
        content: TourContent.FARM_EVENTS_PANEL,
        beacons: ["events", "farm-event"],
        url: "/app/designer/events",
      },
      {
        slug: "points",
        title: t("Points"),
        content: TourContent.POINTS_PANEL,
        beacons: ["points", "point-inventory"],
        url: "/app/designer/points",
      },
      {
        slug: "weeds",
        title: t("Weeds"),
        content: TourContent.WEEDS_PANEL,
        beacons: ["weeds", "weeds-inventory"],
        url: "/app/designer/weeds",
      },
      {
        slug: "controls",
        title: t("Controls"),
        content: TourContent.CONTROLS_PANEL,
        beacons: ["controls"],
        url: "/app/designer/controls",
      },
      {
        slug: "photos",
        title: t("Photos"),
        content: TourContent.PHOTOS_PANEL,
        beacons: ["photos"],
        url: "/app/designer/photos",
      },
      {
        slug: "tools",
        title: t("Tools"),
        content: TourContent.TOOLS_PANEL,
        beacons: ["tools"],
        url: "/app/designer/tools",
      },
      {
        slug: "messages",
        title: t("Messages"),
        content: TourContent.MESSAGES_PANEL,
        beacons: ["messages"],
        url: "/app/designer/messages",
      },
      {
        slug: "help",
        title: t("Help"),
        content: TourContent.HELP_PANEL,
        beacons: ["help"],
        url: "/app/designer/help",
      },
      {
        slug: "settings",
        title: t("Settings"),
        content: TourContent.SETTINGS_PANEL,
        beacons: ["settings"],
        url: "/app/designer/settings",
      },

    ],
  },
});

interface TourStepContainerState {
  title: string;
  message: string;
  transitionOut: boolean;
  transitionIn: boolean;
}

export class TourStepContainer
  extends React.Component<TourStepContainerProps, TourStepContainerState> {
  state: TourStepContainerState = {
    title: "", message: "",
    transitionOut: true, transitionIn: true,
  };

  updateTourState = (
    tour: string | undefined,
    tourStep: string | undefined,
    updateUrl = true,
  ) => {
    const { dispatch } = this.props;
    dispatch({ type: Actions.SET_TOUR, payload: tour });
    dispatch({ type: Actions.SET_TOUR_STEP, payload: tourStep });
    if (tour) {
      const currentStep = TOURS()[tour]?.steps.filter(step =>
        step.slug == tourStep)[0];
      const tourQuery = `?tour=${tour}?tourStep=${tourStep}`;
      push(`${updateUrl && currentStep.url
        ? currentStep.url
        : location.pathname}${tourQuery}`);
    } else {
      push(location.pathname);
    }
  };

  get tourState() {
    return {
      stateTourSlug: this.props.helpState.currentNewTour,
      stateTourStepSlug: this.props.helpState.currentNewTourStep,
      urlTourSlug: getUrlQuery("tour"),
      urlTourStepSlug: getUrlQuery("tourStep"),
    };
  }

  updateStateAndUrl = () => {
    const {
      stateTourSlug, stateTourStepSlug,
      urlTourSlug, urlTourStepSlug,
    } = this.tourState;
    if (!getUrlQuery("tour") && stateTourSlug && stateTourStepSlug) {
      this.updateTourState(stateTourSlug, stateTourStepSlug, false);
    }
    if (urlTourSlug && urlTourStepSlug
      && (!stateTourSlug || !stateTourStepSlug)) {
      this.updateTourState(urlTourSlug, urlTourStepSlug, false);
    }
  }

  render() {
    const { urlTourSlug, urlTourStepSlug } = this.tourState;

    this.updateStateAndUrl();

    if (!urlTourSlug || !urlTourStepSlug) {
      return <div className={"tour-closed"} />;
    }

    const tourSteps = TOURS()[urlTourSlug]?.steps;
    const tourStepSlugs = tourSteps?.map(step => step.slug);
    const currentStep = tourSteps?.filter(step => step.slug == urlTourStepSlug)[0];
    const currentStepIndex = tourStepSlugs?.indexOf(urlTourStepSlug);
    const newTitle = currentStep?.title;
    const extraContent = currentStep?.extraContent && currentStep.extraContent;
    const progressFloat = currentStepIndex == 0
      ? 0
      : (currentStepIndex + 1) / tourStepSlugs?.length;
    const progressPercent = `${round(progressFloat * 100)}%`;

    const getOpacity = () => {
      if (this.state.title != newTitle) {
        setTimeout(() => this.setState({
          title: newTitle,
          message: currentStep?.content,
        }), 400);
        return 0;
      }
      return 1;
    };

    return <div className={"tour-container"}>
      <div className={"tour-toast toast dark-blue active"}>
        <h4 className={"toast-title"} style={{ opacity: getOpacity() }}>
          {this.state.title || newTitle || t("Error: tour step does not exist")}
        </h4>
        <div className={"toast-message"}>
          <div className={"message-contents"} style={{
            height: getMessageHeight(),
            opacity: getOpacity(),
          }}>
            {t(this.state.message)}
            {this.state.title == newTitle && extraContent && extraContent}
          </div>
          <div className={"message-contents height-hidden"}>
            {t(currentStep?.content)}
            {extraContent && extraContent}
          </div>
        </div>
        <TourStepNavigation
          tourStepSlugs={tourStepSlugs}
          currentStepIndex={currentStepIndex}
          urlTourSlug={urlTourSlug}
          updateTourState={this.updateTourState} />
        <div className={"progress-indicator"}
          title={`${progressPercent} complete`}
          style={{
            width: progressPercent,
            borderBottomRightRadius: progressFloat == 1 ? "5px" : 0,
          }} />
      </div>
    </div>;
  }
}

const getMessageHeight = () =>
  document.querySelector(".height-hidden")?.scrollHeight;

interface TourStepNavigationProps {
  tourStepSlugs: string[] | undefined,
  currentStepIndex: number,
  urlTourSlug: string | undefined,
  updateTourState(tour: string | undefined, tourStep: string | undefined): void,
}

const TourStepNavigation = (props: TourStepNavigationProps) => {
  const { tourStepSlugs, currentStepIndex, urlTourSlug, updateTourState } = props;
  const getAdjacentTourStepSlug = (direction: -1 | 1) =>
    tourStepSlugs?.[currentStepIndex + direction];
  const prevStepSlug = getAdjacentTourStepSlug(-1);
  const nextStepSlug = getAdjacentTourStepSlug(1);
  return <div className={"toast-loader"}>
    <i className={`fa fa-backward previous ${prevStepSlug ? "" : "disabled"}`}
      title={t("back")}
      onClick={() => updateTourState(urlTourSlug, prevStepSlug)} />
    <i className={`fa fa-forward next ${nextStepSlug ? "" : "disabled"}`}
      title={t("advance")}
      onClick={() => updateTourState(urlTourSlug, nextStepSlug)} />
    <i className={"fa fa-times exit"}
      title={t("quit")}
      onClick={() => updateTourState(undefined, undefined)} />
  </div>;
};

export const maybeBeacon = (
  compareSlug: string,
  beaconType: "soft" | "hard",
  helpState?: HelpState | undefined,
) =>
  getCurrentTourStepBeacons(helpState)?.includes(compareSlug)
    ? `beacon ${beaconType}`
    : "";

export const getCurrentTourStepBeacons = (helpState?: HelpState) => {
  const currentTourSlug = getUrlQuery("tour") || helpState?.currentNewTour;
  const currentStepSlug = getUrlQuery("tourStep") || helpState?.currentNewTourStep;
  if (!currentTourSlug) { return undefined; }
  return TOURS()[currentTourSlug]?.steps
    .filter(step => step.slug == currentStepSlug)[0]?.beacons;
};
