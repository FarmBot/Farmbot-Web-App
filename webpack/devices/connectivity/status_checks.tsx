import { isUndefined } from "lodash";
import * as moment from "moment";
import { StatusRowProps } from "./index";

const HOUR = 1000 * 60 * 60;
const TWO_HOURS = HOUR * 2;

export function botToAPI(lastSeen: moment.Moment | undefined,
  now = moment()): StatusRowProps {
  // TODO: Complexity is getting high on this one.
  // Refactor if more business requirements are added.
  const diff = lastSeen && now.diff(lastSeen);
  const ago = moment(lastSeen).fromNow();
  const status: StatusRowProps = {
    from: "Bot",
    to: "API",
    connectionStatus: undefined,
    children: "?"
  };

  if (isUndefined(diff)) {
    status.connectionStatus = false;
    status.children = "We have not seen messages from FarmBot yet.";
  }

  if (diff && (diff > TWO_HOURS)) {
    status.connectionStatus = false;
    status.children =
      `Last heard from bot ${ago}.`;
  } else {
    status.connectionStatus = true;
    status.children = `Last seen ${ago}.`;
  }

  return status;
}

export function botToMQTT(lastSeen: string | undefined): StatusRowProps {
  const output: StatusRowProps = {
    from: "Bot",
    to: "MQTT",
    connectionStatus: false,
    children: "We are not seeing any realtime messages from the bot right now."
  };

  if (lastSeen) {
    output.connectionStatus = true;
    output.children = `Connected ${moment(new Date(JSON.parse(lastSeen))).fromNow()}`;
  }

  return output;
}

export function browserToMQTT(mqttUrl: string | undefined, online?: boolean): StatusRowProps {
  const url = `mqtt://${mqttUrl}`;
  return {
    from: "Browser",
    to: "MQTT",
    children: online ? ("Connected to  " + url) : "Unable to connect",
    connectionStatus: online
  };
}
