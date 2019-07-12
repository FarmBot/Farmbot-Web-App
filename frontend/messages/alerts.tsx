import * as React from "react";
import { sortBy, isNumber } from "lodash";
import { ProblemTag, FirmwareAlertsProps, AlertsProps } from "./interfaces";
import { AlertCard } from "./cards";
import { Alert } from "farmbot";

export const splitProblemTag = (problemTag: string): ProblemTag => {
  const parts = problemTag.split(".");
  return { author: parts[0], noun: parts[1], verb: parts[2] };
};

export const sortAlerts = (alerts: Alert[]): Alert[] =>
  sortBy(alerts, "priority", "created_at");

const filterIncompleteAlerts = (x: Alert) =>
  x.problem_tag && isNumber(x.priority) && x.created_at;

export const FirmwareAlerts = (props: FirmwareAlertsProps) => {
  const firmwareAlerts = sortAlerts(props.alerts)
    .filter(filterIncompleteAlerts)
    .filter(x => splitProblemTag(x.problem_tag).noun === "firmware");
  return <div className="firmware-alerts">
    {firmwareAlerts.map((x, i) =>
      <AlertCard key={i}
        alert={x}
        dispatch={props.dispatch}
        apiFirmwareValue={props.apiFirmwareValue}
        timeSettings={props.timeSettings} />)}
  </div>;
};

export const Alerts = (props: AlertsProps) =>
  <div className="problem-alerts">
    <div className="problem-alerts-content">
      {sortAlerts(props.alerts)
        .filter(filterIncompleteAlerts)
        .map(x =>
          <AlertCard key={x.slug + x.created_at}
            alert={x}
            dispatch={props.dispatch}
            apiFirmwareValue={props.apiFirmwareValue}
            timeSettings={props.timeSettings}
            findApiAlertById={props.findApiAlertById} />)}
    </div>
  </div>;
