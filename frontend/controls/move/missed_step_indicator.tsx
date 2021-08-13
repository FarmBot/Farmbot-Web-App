import React from "react";
import { mean, isUndefined, last } from "lodash";
import { Position } from "@blueprintjs/core";
import { t } from "../../i18next_wrapper";
import { Xyz } from "farmbot";
import { Popover } from "../../ui";

export const MISSED_STEP_HISTORY_LENGTH = 10;

enum StorageKey {
  x = "missed_step_history_x",
  y = "missed_step_history_y",
  z = "missed_step_history_z",
}

export interface MissedStepIndicatorProps {
  missedSteps: number | undefined;
  axis: Xyz;
}

interface MissedStepIndicatorState {
  history: number[];
  open: boolean;
}

export class MissedStepIndicator
  extends React.Component<MissedStepIndicatorProps, MissedStepIndicatorState> {
  state: MissedStepIndicatorState = {
    history: JSON.parse(sessionStorage.getItem(this.storageKey) || "[]"),
    open: false,
  };

  get storageKey() { return StorageKey[this.props.axis]; }

  componentDidUpdate() {
    if (!isUndefined(this.props.missedSteps) &&
      this.props.missedSteps != last(this.state.history)) {
      const newHistory = [...this.state.history];
      newHistory.push(this.props.missedSteps);
      this.setState({ history: newHistory.slice(-MISSED_STEP_HISTORY_LENGTH) });
    }
  }

  componentWillUnmount() {
    sessionStorage.setItem(this.storageKey, JSON.stringify(this.state.history));
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
    return <div className={"missed-step-indicator-wrapper"}
      onClick={() => this.setState({ open: !this.state.open })}>
      <Popover position={Position.TOP} usePortal={false} isOpen={this.state.open}
        target={<Indicator instant={missedSteps || 0} peak={this.max} />}
        content={<Details instant={missedSteps || 0}
          peak={this.max} average={this.avg} />} />
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
    <table>
      <tbody>
        <tr>
          <td><p>{`${t("Latest")}:`}</p></td>
          <td><p>{`${props.instant}%`}</p></td>
        </tr>
        <tr>
          <td><p>{`${t("Max")}:`}</p></td>
          <td><p>{`${props.peak}%`}</p></td>
        </tr>
        <tr>
          <td><p>{`${t("Average")}:`}</p></td>
          <td><p>{`${props.average}%`}</p></td>
        </tr>
      </tbody>
    </table>
  </div>;
