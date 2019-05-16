import { Everything } from "../interfaces";
import { MessagesProps, Alert } from "./interfaces";
import { validFbosConfig, betterCompact } from "../util";
import { getFbosConfig } from "../resources/getters";
import { sourceFbosConfigValue } from "../devices/components/source_config_value";
import {
  selectAllAlerts, maybeGetTimeSettings, findResourceById
} from "../resources/selectors";
import { isFwHardwareValue } from "../devices/components/fbos_settings/board_type";
import { ResourceIndex, UUID } from "../resources/interfaces";
import { BotState } from "../devices/interfaces";

export const mapStateToProps = (props: Everything): MessagesProps => {
  const { hardware } = props.bot;
  const fbosConfig = validFbosConfig(getFbosConfig(props.resources.index));
  const sourceFbosConfig =
    sourceFbosConfigValue(fbosConfig, hardware.configuration);
  const apiFirmwareValue = sourceFbosConfig("firmware_hardware").value;
  const findApiAlertById = (id: number): UUID =>
    findResourceById(props.resources.index, "Alert", id);
  return {
    alerts: getAlerts(props.resources.index, props.bot),
    apiFirmwareValue: isFwHardwareValue(apiFirmwareValue)
      ? apiFirmwareValue : undefined,
    timeSettings: maybeGetTimeSettings(props.resources.index),
    dispatch: props.dispatch,
    findApiAlertById,
  };
};

export const getAlerts =
  (resourceIndex: ResourceIndex, bot: BotState): Alert[] => {
    const botAlerts = betterCompact(Object.values(bot.hardware.alerts || {}));
    const apiAlerts = selectAllAlerts(resourceIndex).map(x => x.body);
    return botAlerts.concat(apiAlerts);
  };
