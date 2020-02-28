import * as React from "react";
import Joyride, { Step as TourStep, CallBackProps } from "react-joyride";
import { Color } from "../ui";
import { history } from "../history";
import { TOUR_STEPS, tourPageNavigation } from "./tours";
import { t } from "../i18next_wrapper";
import { Actions } from "../constants";
import { store } from "../redux/store";
import { ErrorBoundary } from "../error_boundary";

const strings = () => ({
  back: t("Back"),
  close: t("Close"),
  last: t("End Tour"),
  next: t("Next"),
  skip: t("End Tour")
});

const STYLES = {
  buttonNext: { backgroundColor: Color.green },
  buttonBack: { color: Color.darkGray }
};

interface TourProps {
  steps: TourStep[];
}

interface TourState {
  run: boolean;
  index: number;
  returnPath: string;
}

export class Tour extends React.Component<TourProps, TourState> {
  state: TourState = { run: false, index: 0, returnPath: "" };

  callback = ({ action, index, step, type }: CallBackProps) => {
    console.log("Tour debug:", step.target, type, action);
    tourPageNavigation(step.target);
    if (type === "step:after") {
      const increment = action === "prev" ? -1 : 1;
      const nextStepIndex = index + increment;
      this.setState({ index: nextStepIndex });
      const nextStepTarget = nextStepIndex < this.props.steps.length
        ? this.props.steps[nextStepIndex].target : "";
      tourPageNavigation(nextStepTarget);
    }
    if (type === "tour:end") {
      this.setState({ run: false });
      history.push(this.state.returnPath);
      store.dispatch({ type: Actions.START_TOUR, payload: undefined });
    }
  };

  componentDidMount() {
    this.setState({
      run: true,
      index: 0,
      returnPath: history.getCurrentLocation().pathname,
    });
  }

  render() {
    const steps = this.props.steps.map(step => {
      step.disableBeacon = true;
      return step;
    });
    return <div className="tour">
      <ErrorBoundary>
        <Joyride
          steps={steps}
          run={this.state.run}
          callback={this.callback}
          stepIndex={this.state.index}
          showSkipButton={true}
          continuous={true}
          styles={STYLES}
          locale={strings()} />
      </ErrorBoundary>
    </div>;
  }
}

export const RunTour = ({ currentTour }: { currentTour: string | undefined }) => {
  return currentTour
    ? <Tour steps={TOUR_STEPS()[currentTour]} />
    : <div className={"tour-inactive"} />;
};
