import { Everything } from "../interfaces";
import { MessagesProps, AlertReducerState } from "./interfaces";
import { validFbosConfig, betterCompact } from "../util";
import { getFbosConfig } from "../resources/getters";
import { sourceFbosConfigValue } from "../devices/components/source_config_value";
import {
  selectAllAlerts, maybeGetTimeSettings, findResourceById
} from "../resources/selectors";
import {
  isFwHardwareValue
} from "../devices/components/firmware_hardware_support";
import { ResourceIndex, UUID } from "../resources/interfaces";
import { Alert } from "farmbot";

export const mapStateToProps = (props: Everything): MessagesProps => {
  const { hardware } = props.bot;
  const fbosConfig = validFbosConfig(getFbosConfig(props.resources.index));
  const sourceFbosConfig =
    sourceFbosConfigValue(fbosConfig, hardware.configuration);
  const apiFirmwareValue = sourceFbosConfig("firmware_hardware").value;
  const findApiAlertById = (id: number): UUID =>
    findResourceById(props.resources.index, "Alert", id);
  return {
    alerts: getAllAlerts(props.resources),
    apiFirmwareValue: isFwHardwareValue(apiFirmwareValue)
      ? apiFirmwareValue : undefined,
    timeSettings: maybeGetTimeSettings(props.resources.index),
    dispatch: props.dispatch,
    findApiAlertById,
  };
};

export const getAllAlerts = (resources: Everything["resources"]) => ([
  ...getApiAlerts(resources.index),
  ...getLocalAlerts(resources.consumers.alerts),
]);

const getApiAlerts = (resourceIndex: ResourceIndex): Alert[] =>
  selectAllAlerts(resourceIndex).map(x => x.body);

const getLocalAlerts = ({ alerts }: AlertReducerState): Alert[] =>
  betterCompact(Object.values(alerts));
