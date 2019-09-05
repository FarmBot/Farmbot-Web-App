import { isUndefined } from "lodash";
import moment from "moment";
import { StatusRowProps } from "./connectivity_row";
import { ConnectionStatus } from "../../connectivity/interfaces";
import { t } from "../../i18next_wrapper";
import {
  getBoardCategory, isKnownBoard
} from "../components/firmware_hardware_support";

const HOUR = 1000 * 60 * 60;

const SIX_HOURS = HOUR * 6;

const NOT_SEEN = t("No messages seen yet.");

export function ago(input: number) {
  return moment(new Date(input)).fromNow();
}

function lastSeen(stat: ConnectionStatus | undefined): string {
  return stat ? t("Last message seen ") + `${ago(stat.at)}.` : NOT_SEEN;
}

function statusOf(stat: ConnectionStatus | undefined): boolean | undefined {
  return (stat && stat.state == "up");
}

export function botToAPI(stat: string | undefined,
  now = (new Date).getTime()): StatusRowProps {
  const connectionStatus =
    (stat ? ((now - new Date(stat).getTime()) < SIX_HOURS) : false);
  return {
    connectionName: "botAPI",
    from: "FarmBot",
    to: "Web App",
    connectionStatus,
    children: stat ? t("Last message seen ") + `${ago(new Date(stat).getTime())}.` : NOT_SEEN
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
  const connection = (): { status: boolean | undefined, msg: string } => {
    const status = isKnownBoard(version);
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
    to: getBoardCategory(version),
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
