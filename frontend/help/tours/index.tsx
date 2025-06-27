import React from "react";
import { t } from "../../i18next_wrapper";
import { round } from "lodash";
import { Actions } from "../../constants";
import { getUrlQuery } from "../../util";
import { HelpState } from "../reducer";
import { TourStepContainerProps, TourStepContainerState } from "./interfaces";
import { TOURS } from "./data";
import { NavigationContext } from "../../routes_helpers";

export const tourPath = (
  stepUrl: string | undefined,
  tour: string,
  tourStep: string | undefined,
) =>
  `${stepUrl || location.pathname}?tour=${tour}&tourStep=${tourStep}`;

export class TourStepContainer
  extends React.Component<TourStepContainerProps, TourStepContainerState> {
  state: TourStepContainerState = {
    title: "", message: "",
    transitionOut: true, transitionIn: true,
    highlighted: false,
    activeBeacons: [],
  };

  static contextType = NavigationContext;
  context!: React.ContextType<typeof NavigationContext>;
  navigate = this.context;

  updateTourState = (
    tour: string | undefined,
    tourStep: string | undefined,
    updateUrl = true,
  ) => {
    const { dispatch } = this.props;
    dispatch({ type: Actions.SET_TOUR, payload: tour });
    dispatch({ type: Actions.SET_TOUR_STEP, payload: tourStep });
    if (tour) {
      const currentStep = TOURS(this.props.firmwareHardware)[tour]?.steps
        .filter(step => step.slug == tourStep)[0];
      this.navigate(tourPath(
        updateUrl ? currentStep.url : undefined,
        tour,
        tourStep));
      currentStep?.dispatchActions
        && currentStep.dispatchActions.map(action => dispatch(action));
    } else {
      this.navigate(location.pathname);
    }
  };

  get tourState() {
    return {
      stateTourSlug: this.props.helpState.currentTour,
      stateTourStepSlug: this.props.helpState.currentTourStep,
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
  };

  componentWillUnmount = () => this.state.activeBeacons.map(beacon =>
    document.querySelector(`.${beacon}`)?.classList.remove("beacon"));

  render() {
    const { urlTourSlug, urlTourStepSlug } = this.tourState;

    this.updateStateAndUrl();

    if (!urlTourSlug || !urlTourStepSlug) {
      return <div className={"tour-closed"} />;
    }

    const tourSteps = TOURS(this.props.firmwareHardware)[urlTourSlug]?.steps;
    const tourStepSlugs = tourSteps?.map(step => step.slug);
    const currentStep = tourSteps?.filter(step => step.slug == urlTourStepSlug)[0];
    const currentStepIndex = tourStepSlugs?.indexOf(urlTourStepSlug);
    const newTitle = currentStep?.title;
    const extraContent = currentStep?.extraContent && currentStep.extraContent;
    const progressFloat = currentStepIndex == 0
      ? 0
      : (currentStepIndex + 1) / tourStepSlugs?.length;
    const progressPercent = `${round(progressFloat * 100)}%`;

    currentStep?.activeBeacons?.map(beacon => {
      const element = document.querySelector(`.${beacon.class}`);
      if (element && !this.state.highlighted) {
        this.setState({ highlighted: true });
        element.classList.add("beacon");
        element.classList.add("beacon-transition");
        element.classList.add(beacon.type);
        (beacon.type != "hard" && !beacon.keep)
          ? setTimeout(() => element.classList.remove("beacon"), 2000)
          : this.setState({
            activeBeacons: this.state.activeBeacons.concat(beacon.class),
          });
      }
    });

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
    <i className={`fa fa-backward fb-icon-button previous ${prevStepSlug ? "" : "disabled"}`}
      title={t("back")}
      onClick={() => updateTourState(urlTourSlug, prevStepSlug)} />
    <i className={`fa fa-forward fb-icon-button next ${nextStepSlug ? "" : "disabled"}`}
      title={t("advance")}
      onClick={() => updateTourState(urlTourSlug, nextStepSlug)} />
    <i className={"fa fa-times fb-icon-button exit"}
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

export const getCurrentTourStepBeacons = (
  helpState?: HelpState,
) => {
  const currentTourSlug = getUrlQuery("tour") || helpState?.currentTour;
  const currentStepSlug = getUrlQuery("tourStep") || helpState?.currentTourStep;
  if (!currentTourSlug) { return undefined; }
  const currentStep = TOURS()[currentTourSlug]?.steps
    .filter(step => step.slug == currentStepSlug)[0];
  return currentStep?.beacons;
};
