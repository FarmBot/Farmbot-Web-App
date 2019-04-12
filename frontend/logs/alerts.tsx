import * as React from "react";
import { t } from "../i18next_wrapper";
import { betterCompact } from "../util";
import { BotState } from "../devices/interfaces";
import {
  FirmwareActions
} from "../devices/components/fbos_settings/firmware_hardware_status";
import { formatLogTime } from "./index";
import { TimeSettings } from "../interfaces";
import { Enigma } from "farmbot";
import { sortBy } from "lodash";

export interface AlertsProps {
  alerts: Alert[];
  apiFirmwareValue: string | undefined;
  timeSettings: TimeSettings;
}

interface AlertsState {
  open: boolean;
}

interface ProblemTag {
  author: string;
  noun: string;
  verb: string;
}

const splitTag = (problemTag: string): ProblemTag => {
  const parts = problemTag.split(".");
  return { author: parts[0], noun: parts[1], verb: parts[2] };
};

export const sortAlerts = (alerts: Alert[]): Alert[] =>
  sortBy(alerts, "priority", "created_at");

export class Alerts extends React.Component<AlertsProps, AlertsState> {
  state: AlertsState = { open: true };
  render() {
    const alertCount = Object.entries(this.props.alerts).length;
    return alertCount > 0
      ? <div className="problem-alerts">
        <div className="problem-alerts-header"
          onClick={() => this.setState({ open: !this.state.open })}>
          <h3>{t("Alerts")}</h3>
          <div className={"saucer warn"}>
            <p>{alertCount}</p>
          </div>
          <i className={`fa fa-caret-${this.state.open ? "up" : "down"}`} />
        </div>
        {this.state.open &&
          <div className="problem-alerts-content">
            {sortAlerts(this.props.alerts).map((x, i) =>
              <AlertCard key={i}
                alert={x}
                apiFirmwareValue={this.props.apiFirmwareValue}
                timeSettings={this.props.timeSettings} />)}
          </div>}
      </div> : <div />;
  }
}

export interface FirmwareAlertsProps {
  bot: BotState;
  apiFirmwareValue: string | undefined;
  timeSettings: TimeSettings;
}

export const FirmwareAlerts = (props: FirmwareAlertsProps) => {
  const alerts = betterCompact(Object.values(props.bot.hardware.enigmas || {}));
  const firmwareAlerts = sortAlerts(alerts)
    .filter(x => splitTag(x.problem_tag).noun === "firmware");
  return <div className="firmware-alerts">
    {firmwareAlerts.map((x, i) =>
      <AlertCard key={i}
        alert={x}
        apiFirmwareValue={props.apiFirmwareValue}
        timeSettings={props.timeSettings} />)}
  </div>;
};

export interface Alert extends Enigma { }

interface AlertCardProps {
  alert: Alert;
  apiFirmwareValue: string | undefined;
  timeSettings: TimeSettings;
}

const AlertCard = (props: AlertCardProps) => {
  switch (props.alert.problem_tag) {
    case "farmbot_os.firmware.missing":
      return <FirmwareMissing
        createdAt={props.alert.created_at}
        apiFirmwareValue={props.apiFirmwareValue}
        timeSettings={props.timeSettings} />;
    default:
      return UnknownAlert(props.alert, props.timeSettings);
  }
};

const UnknownAlert = (alert: Alert, timeSettings: TimeSettings) => {
  const { problem_tag, priority, created_at } = alert;
  const { author, noun, verb } = splitTag(problem_tag);
  const createdAt = formatLogTime(created_at, timeSettings);
  return <div className="problem-alert unknown-alert">
    <div className="problem-alert-title">
      <i className="fa fa-exclamation-triangle" />
      <h3>{`${t(noun)}: ${t(verb)} (${t(author)})`}</h3>
      <p>{createdAt}</p>
    </div>
    <div className="problem-alert-content">
      <p>
        {t("Unknown problem of priority {{priority}} created at {{createdAt}}",
          { priority, createdAt })}
      </p>
    </div>
  </div>;
};

interface FirmwareMissingProps {
  createdAt: number;
  apiFirmwareValue: string | undefined;
  timeSettings: TimeSettings;
}

const FirmwareMissing = (props: FirmwareMissingProps) =>
  <div className="problem-alert firmware-missing-alert">
    <div className="problem-alert-title">
      <i className="fa fa-exclamation-triangle" />
      <h3>{t("Firmware missing")}</h3>
      <p>{formatLogTime(props.createdAt, props.timeSettings)}</p>
    </div>
    <div className="problem-alert-content">
      <p>{t("Your device has no firmware installed.")}</p>
      <FirmwareActions
        apiFirmwareValue={props.apiFirmwareValue}
        botOnline={true} />
    </div>
  </div>;
