import { isUndefined } from "lodash";
import moment from "moment";
import { StatusRowProps } from "./connectivity_row";
import { ConnectionStatus } from "../../connectivity/interfaces";
import { t } from "i18next";

const HOUR = 1000 * 60 * 60;

const SIX_HOURS = HOUR * 6;

const NOT_SEEN = t("No messages seen yet.");

export function ago(input: string) {
  return moment(new Date(input)).fromNow();
}

function lastSeen(stat: ConnectionStatus | undefined): string {
  return stat ? t("Last message seen ") + `${ago(stat.at)}.` : NOT_SEEN;
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
    children: stat ? t("Last message seen ") + `${ago(stat)}.` : NOT_SEEN
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
  const boardIdentifier = version ? version.slice(-1) : "undefined";
  const connection = (): { status: boolean | undefined, msg: string } => {
    const status = ["R", "F", "G"].includes(boardIdentifier);
    if (isUndefined(version)) {
      return { status: undefined, msg: t("Unknown.") };
    }
    return {
      status, msg: status
        ? t("Connected.")
        : t("Disconnected.")
    };
  };
  return {
    connectionName: "botFirmware",
    from: "Raspberry Pi",
    to: ["F", "G"].includes(boardIdentifier) ? "Farmduino" : "Arduino",
    children: connection().msg,
    connectionStatus: connection().status
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
