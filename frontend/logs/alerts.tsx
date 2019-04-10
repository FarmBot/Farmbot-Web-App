import * as React from "react";
import { t } from "../i18next_wrapper";
import { betterCompact } from "../util";
import { BotState } from "../devices/interfaces";
import {
  FirmwareActions
} from "../devices/components/fbos_settings/firmware_hardware_status";

export interface AlertsProps {
  alerts: Alert[];
  apiFirmwareValue: string | undefined;
}

interface AlertsState {
  open: boolean;
}

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
            {this.props.alerts.sort((a, b) => a.priority - b.priority)
              .map((x, i) =>
                <AlertCard key={i}
                  alert={x}
                  apiFirmwareValue={this.props.apiFirmwareValue} />)}
          </div>}
      </div> : <div />;
  }
}

export interface FirmwareAlertsProps {
  bot: BotState;
  apiFirmwareValue: string | undefined;
}

export const FirmwareAlerts = (props: FirmwareAlertsProps) => {
  const alerts = betterCompact(Object.values(props.bot.hardware.enigmas || {})
    .filter(x => x && x.problem_tag.startsWith("firmware")))
    .sort((a, b) => a.priority - b.priority);
  return <div className="firmware-alerts">
    {alerts.map((x, i) =>
      <AlertCard key={i} alert={x} apiFirmwareValue={props.apiFirmwareValue} />)}
  </div>;
};

export interface Alert {
  created_at: string;
  updated_at: string;
  problem_tag: string;
  priority: number;
}

interface AlertCardProps {
  alert: Alert;
  apiFirmwareValue: string | undefined;
}

const AlertCard = (props: AlertCardProps) => {
  switch (props.alert.problem_tag) {
    case "firmware.missing":
      return <FirmwareMissing
        updatedAt={props.alert.updated_at}
        apiFirmwareValue={props.apiFirmwareValue} />;
    default:
      return <UnknownAlert {...props.alert} />;
  }
};

const UnknownAlert = (alert: Alert) => {
  const { problem_tag, priority, created_at, updated_at } = alert;
  const tagParts = problem_tag.split(".");
  return <div className="problem-alert unknown-alert">
    <div className="problem-alert-title">
      <i className="fa fa-exclamation-triangle" />
      <h3>{`${t(tagParts[0])}: ${t(tagParts[1])}`}</h3>
      <p>{updated_at}</p>
    </div>
    <div className="problem-alert-content">
      <p>
        {t("Unknown problem of priority {{priority}} created at {{created_at}}",
          { priority, created_at })}
      </p>
    </div>
  </div>;
};

interface FirmwareMissingProps {
  updatedAt: string;
  apiFirmwareValue: string | undefined;
}

const FirmwareMissing = (props: FirmwareMissingProps) =>
  <div className="problem-alert firmware-missing-alert">
    <div className="problem-alert-title">
      <i className="fa fa-exclamation-triangle" />
      <h3>{t("Firmware missing")}</h3>
      <p>{props.updatedAt}</p>
    </div>
    <div className="problem-alert-content">
      <p>{t("Your device has no firmware installed.")}</p>
      <FirmwareActions
        apiFirmwareValue={props.apiFirmwareValue}
        botOnline={true} />
    </div>
  </div>;
