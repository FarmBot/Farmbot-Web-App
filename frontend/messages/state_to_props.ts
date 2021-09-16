import { Everything } from "../interfaces";
import { MessagesProps, AlertReducerState } from "./interfaces";
import { betterCompact } from "../util";
import { getFbosConfig } from "../resources/getters";
import {
  selectAllAlerts, maybeGetTimeSettings, maybeGetDevice, findUuid,
} from "../resources/selectors";
import { getFwHardwareValue } from "../settings/firmware/firmware_hardware_support";
import { ResourceIndex } from "../resources/interfaces";
import { Alert } from "farmbot";

export const mapStateToProps = (props: Everything): MessagesProps => {
  return {
    alerts: getAllAlerts(props.resources),
    apiFirmwareValue: getFwHardwareValue(getFbosConfig(props.resources.index)),
    timeSettings: maybeGetTimeSettings(props.resources.index),
    dispatch: props.dispatch,
    findApiAlertById: id => findUuid(props.resources.index, "Alert", id),
  };
};

export const getAllAlerts = (resources: Everything["resources"]) => ([
  ...getApiAlerts(resources.index),
  ...getLocalAlerts(resources.consumers.alerts),
  ...(maybeGetDevice(resources.index)?.body.setup_completed_at
    ? []
    : [setupIncompleteAlert]),
]);

const getApiAlerts = (resourceIndex: ResourceIndex): Alert[] =>
  selectAllAlerts(resourceIndex).map(x => x.body);

const getLocalAlerts = ({ alerts }: AlertReducerState): Alert[] =>
  betterCompact(Object.values(alerts));

export const setupIncompleteAlert = {
  created_at: 1,
  problem_tag: "api.setup.not_completed",
  priority: 500,
  slug: "setup-incomplete",
};
