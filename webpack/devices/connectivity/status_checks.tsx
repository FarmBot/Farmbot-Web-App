import { isUndefined } from "lodash";
import * as moment from "moment";
import { StatusRowProps } from "./connectivity_row";
import { ConnectionStatus } from "../../connectivity/interfaces";
import { t } from "i18next";

const HOUR = 1000 * 60 * 60;

const SIX_HOURS = HOUR * 6;

const NOT_SEEN = t("No messages seen yet.");

function ago(input: string) {
  return moment(new Date(input)).fromNow();
}

function lastSeen(stat: ConnectionStatus | undefined): string {
  return stat ? `Last message seen ${ago(stat.at)}.` : NOT_SEEN;
}

function statusOf(stat: ConnectionStatus | undefined): boolean | undefined {
  return (stat && stat.state == "up");
}

export function botToAPI(stat: string | undefined,
  now = moment()): StatusRowProps {

  return {
    connectionName: "botAPI",
    from: "FarmBot",
    to: "Web App",
    connectionStatus: stat ? (now.diff(moment(stat)) < SIX_HOURS) : false,
    children: stat ? `Last message seen ${ago(stat)}.` : NOT_SEEN
  };
}

export function botToMQTT(stat: ConnectionStatus | undefined): StatusRowProps {
  return {
    connectionName: "botMQTT",
    from: "FarmBot",
    to: t("Message Broker"),
    connectionStatus: statusOf(stat),
    children: (stat && stat.state === "up")
      ? lastSeen(stat)
      : t("No recent messages.")
  };
}

export function browserToMQTT(status:
  ConnectionStatus | undefined): StatusRowProps {

  return {
    connectionName: "browserMQTT",
    from: t("Browser"),
    to: t("Message Broker"),
    children: lastSeen(status),
    connectionStatus: statusOf(status)
  };
}

export function botToFirmware(version: string | undefined): StatusRowProps {
  const online = !isUndefined(version) && !version.includes("Disconnected");
  const boardIdentifier = version ? version.slice(-1) : "undefined";
  return {
    connectionName: "botFirmware",
    from: "Raspberry Pi",
    to: boardIdentifier === "F" ? "Farmduino" : "Arduino",
    children: online ? t("Connected.") : t("Disconnected."),
    connectionStatus: online
  };
}

export function browserToAPI(status?: ConnectionStatus | undefined): StatusRowProps {
  return {
    connectionName: "browserAPI",
    from: t("Browser"),
    to: t("Internet"),
    children: lastSeen(status),
    connectionStatus: statusOf(status)
  };
}
