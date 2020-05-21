import * as React from "react";
import { mean, isUndefined, last } from "lodash";
import { Popover, Position } from "@blueprintjs/core";
import { t } from "../../i18next_wrapper";

export interface MissedStepIndicatorProps {
  missedSteps: number | undefined;
}

interface MissedStepIndicatorState {
  history: number[];
}

export class MissedStepIndicator
  extends React.Component<MissedStepIndicatorProps, MissedStepIndicatorState> {
  state: MissedStepIndicatorState = { history: [] };

  componentDidUpdate() {
    if (!isUndefined(this.props.missedSteps) &&
      this.props.missedSteps != last(this.state.history)) {
      const newHistory = [...this.state.history];
      newHistory.push(this.props.missedSteps);
      this.setState({ history: newHistory.slice(-10) });
    }
  }

  get max() {
    return this.state.history.length > 0
      ? Math.max(...this.state.history)
      : this.props.missedSteps || 0;
  }

  get avg() {
    return this.state.history.length > 0
      ? Math.round(mean(this.state.history))
      : this.props.missedSteps || 0;
  }

  render() {
    const { missedSteps } = this.props;
    return <div className={"missed-step-indicator-wrapper"}>
      <Popover position={Position.TOP} usePortal={false}>
        <Indicator instant={missedSteps || 0} peak={this.max} />
        <Details instant={missedSteps || 0} peak={this.max} average={this.avg} />
      </Popover>
    </div>;
  }
}

export const indicatorColor = (value: number) => {
  if (value >= 90) { return "red"; }
  if (value >= 75) { return "orange"; }
  if (value >= 50) { return "yellow"; }
  return "green";
};

interface IndicatorProps {
  instant: number;
  peak: number;
}

const Indicator = (props: IndicatorProps) =>
  <div className={"missed-step-indicator"}>
    <div className={`instant ${indicatorColor(props.instant)}`}
      style={{ width: `${props.instant}%` }} />
    <div className={`peak ${indicatorColor(props.peak)}`}
      style={{ marginLeft: `${props.peak}%` }} />
  </div>;

interface DetailsProps {
  instant: number;
  peak: number;
  average: number;
}

const Details = (props: DetailsProps) =>
  <div className={"missed-step-details"}>
    <label>{t("Motor Load")}</label>
    <p>{`${t("Latest")}: ${props.instant}%`}</p>
    <p>{`${t("Max")}: ${props.peak}%`}</p>
    <p>{`${t("Average")}: ${props.average}%`}</p>
  </div>;
