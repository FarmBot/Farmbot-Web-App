import { Everything } from "../interfaces";
import { MessagesProps } from "./interfaces";
import { validFbosConfig } from "../util";
import { getFbosConfig } from "../resources/getters";
import { sourceFbosConfigValue } from "../devices/components/source_config_value";
import {
  selectAllAlerts, maybeGetTimeSettings, findResourceById
} from "../resources/selectors";
import { isFwHardwareValue } from "../devices/components/fbos_settings/board_type";
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
    alerts: getAlerts(props.resources.index),
    apiFirmwareValue: isFwHardwareValue(apiFirmwareValue)
      ? apiFirmwareValue : undefined,
    timeSettings: maybeGetTimeSettings(props.resources.index),
    dispatch: props.dispatch,
    findApiAlertById,
  };
};

export const getAlerts = (resourceIndex: ResourceIndex): Alert[] => {
  return selectAllAlerts(resourceIndex).map(x => x.body);
};
