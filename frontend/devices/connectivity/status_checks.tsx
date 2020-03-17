import { isUndefined } from "lodash";
import moment from "moment";
import { StatusRowProps } from "./connectivity_row";
import { ConnectionStatus } from "../../connectivity/interfaces";
import { t } from "../../i18next_wrapper";
import {
  getBoardCategory, isKnownBoard,
} from "../components/firmware_hardware_support";

/** "<how long> ago" for a given ISO time string or time in milliseconds. */
export const ago = (input: string | number) => moment(input).fromNow();

const lastSeen = (lastSaw: string | number | undefined) =>
  lastSaw
    ? t("Last message seen ") + `${ago(lastSaw)}.`
    : t("No messages seen yet.");

const isUp = (stat: ConnectionStatus | undefined): boolean | undefined =>
  stat && stat.state == "up";

/** The bot to API connection is considered up if there have been requests
 *  within the last few hours. */
const isApiUp = (lastSaw: string | undefined, now: number): boolean =>
  !!lastSaw && moment(now).diff(lastSaw, "hours") < 6;

/**
 * MQTT connection status `at` time is updated even when the network goes down.
 * This function rejects inaccurate last up times by checking the connection
 * state before returning a last seen time. Ideally, MQTT last up times
 * (browser and bot) would be stored and used here to provide accurate
 * last up times when the connection state is down.
 */
const lastSeenUp = (stat: ConnectionStatus | undefined): string =>
  (stat && isUp(stat)) ? lastSeen(stat.at) : t("No recent messages.");

export function botToAPI(
  lastSawApi: string | undefined,
  now = (new Date).getTime()):
  StatusRowProps {
  return {
    connectionName: "botAPI",
    from: "FarmBot",
    to: t("Web App"),
    connectionStatus: isApiUp(lastSawApi, now),
    children: lastSeen(lastSawApi),
  };
}

export function browserToAPI(status: ConnectionStatus | undefined):
  StatusRowProps {
  return {
    connectionName: "browserAPI",
    from: t("Browser"),
    to: t("Internet"),
    children: lastSeen(status ? status.at : undefined),
    connectionStatus: isUp(status),
  };
}

export function botToMQTT(status: ConnectionStatus | undefined):
  StatusRowProps {
  return {
    connectionName: "botMQTT",
    from: "FarmBot",
    to: t("Message Broker"),
    connectionStatus: isUp(status),
    children: lastSeenUp(status),
  };
}

export function browserToMQTT(status: ConnectionStatus | undefined):
  StatusRowProps {
  return {
    connectionName: "browserMQTT",
    from: t("Browser"),
    to: t("Message Broker"),
    connectionStatus: isUp(status),
    children: lastSeenUp(status),
  };
}

export function botToFirmware(version: string | undefined): StatusRowProps {
  const connection = (): { status: boolean | undefined, msg: string } => {
    const status = isKnownBoard(version);
    return isUndefined(version)
      ? { status: undefined, msg: t("Unknown.") }
      : { status, msg: status ? t("Connected.") : t("Disconnected.") };
  };
  return {
    connectionName: "botFirmware",
    from: "Raspberry Pi",
    to: getBoardCategory(version),
    connectionStatus: connection().status,
    children: connection().msg,
  };
}
