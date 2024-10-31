import React from "react";
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

export const filterAlerts = (x: Alert) =>
  x.problem_tag != "farmbot_os.firmware.missing";

export const firmwareAlerts = (alerts: Alert[]) =>
  sortAlerts(alerts)
    .filter(filterIncompleteAlerts)
    .filter(x => splitProblemTag(x.problem_tag).noun === "firmware");

export const FirmwareAlerts = (props: FirmwareAlertsProps) =>
  <div className="firmware-alerts">
    {firmwareAlerts(props.alerts).map((x, i) =>
      <AlertCard key={i}
        alert={x}
        dispatch={props.dispatch}
        apiFirmwareValue={props.apiFirmwareValue}
        timeSettings={props.timeSettings} />)}
  </div>;

export const Alerts = (props: AlertsProps) =>
  <div className="problem-alerts">
    <div className="problem-alerts-content grid double-gap">
      {sortAlerts(props.alerts)
        .filter(filterIncompleteAlerts)
        .filter(filterAlerts)
        .map(x =>
          <AlertCard key={x.slug + x.created_at}
            alert={x}
            dispatch={props.dispatch}
            apiFirmwareValue={props.apiFirmwareValue}
            timeSettings={props.timeSettings}
            findApiAlertById={props.findApiAlertById} />)}
    </div>
  </div>;
