import { isUndefined } from "lodash";
import * as moment from "moment";
import { StatusRowProps } from "./connectivity_row";
import { ConnectionStatus } from "../../connectivity/interfaces";

const HOUR = 1000 * 60 * 60;

const SIX_HOURS = HOUR * 6;

const NOT_SEEN = "No messages seen yet.";

function ago(input: string) {
  return moment(new Date(input)).fromNow();
}

function lastSeen(stat: ConnectionStatus | undefined): string {
  return stat ? `Last message seen ${ago(stat.at)}.` : NOT_SEEN;
}

function statusOf(stat: ConnectionStatus | undefined): boolean | undefined {
  return stat ? (stat.state == "up") : undefined;
}

export function botToAPI(stat: ConnectionStatus | undefined,
  now = moment()): StatusRowProps {

  const status: StatusRowProps = {
    connectionName: "botAPI",
    from: "Bot",
    to: "Web App",
    connectionStatus: statusOf(stat),
    children: lastSeen(stat)
  };

  if (stat && (now.diff(moment(stat.at)) > SIX_HOURS)) {
    status.connectionStatus = false;
  }

  return status;
}

export function botToMQTT(stat: ConnectionStatus | undefined): StatusRowProps {
  return {
    connectionName: "botMQTT",
    from: "Bot",
    to: "Message Broker",
    connectionStatus: statusOf(stat),
    children: lastSeen(stat)
  };
}

export function browserToMQTT(status:
  ConnectionStatus | undefined): StatusRowProps {

  return {
    connectionName: "browserMQTT",
    from: "Browser",
    to: "Message Broker",
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
    children: online ? "Connected." : "Disconnected.",
    connectionStatus: online
  };
}

export function browserToAPI(status?: ConnectionStatus | undefined): StatusRowProps {
  return {
    connectionName: "browserAPI",
    from: "Browser",
    to: "Internet",
    children: lastSeen(status),
    connectionStatus: statusOf(status)
  };
}
