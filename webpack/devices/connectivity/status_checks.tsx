import { isUndefined } from "lodash";
import * as moment from "moment";
import { StatusRowProps } from "./connectivity_row";
import { ConnectionStatus } from "../../connectivity/interfaces";

const HOUR = 1000 * 60 * 60;
const SIX_HOURS = HOUR * 6;

export function botToAPI(lastSeen: moment.Moment | undefined,
  now = moment()): StatusRowProps {

  const status: StatusRowProps = {
    from: "Bot",
    to: "Web App",
    connectionStatus: false,
    children: "We have not seen messages from FarmBot yet."
  };

  const diff = lastSeen && now.diff(lastSeen);

  if (!isUndefined(diff)) {
    status.connectionStatus = (diff < SIX_HOURS); // This is a guess.
    status.children = `Last seen ${moment(lastSeen).fromNow()}.`;
  }

  return status;
}

export function botToMQTT(lastSeen: string | undefined,
  now = moment()): StatusRowProps {
  const output: StatusRowProps = {
    from: "Bot",
    to: "Message Broker",
    connectionStatus: false,
    children: "We are not seeing any realtime messages from the bot right now."
  };

  if (lastSeen) {
    output.connectionStatus = true;
    const ago = moment(new Date(JSON.parse(lastSeen))).fromNow();
    output.children = `Connected ${ago}.`;
  }

  return output;
}

export function browserToMQTT(online?: boolean): StatusRowProps {
  return {
    from: "Browser",
    to: "Message Broker",
    children: online ? "Connected." : "Unable to connect.",
    connectionStatus: online
  };
}

export function botToFirmware(version: string | undefined): StatusRowProps {
  const online = !isUndefined(version) && !version.includes("Disconnected");
  const boardIdentifier = version ? version.slice(-1) : "undefined";
  return {
    from: "Raspberry Pi",
    to: boardIdentifier === "F" ? "Farmduino" : "Arduino",
    children: online ? "Connected." : "Disconnected.",
    connectionStatus: online
  };
}

const UNKNOWN = "Waiting for response from network";

export function browserToAPI(status?: ConnectionStatus): StatusRowProps {
  return {
    from: "Browser",
    to: "Internet",
    children: status ?
      `Last seen ${moment(new Date(status.at)).fromNow()}` : UNKNOWN,
    connectionStatus: !!(status && status.state === "up")
  };
}
