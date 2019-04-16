import { Everything } from "../interfaces";
import { MessagesProps } from "./interfaces";
import { validFbosConfig, betterCompact } from "../util";
import { getFbosConfig } from "../resources/getters";
import { sourceFbosConfigValue } from "../devices/components/source_config_value";
import { DevSettings } from "../account/dev/dev_support";
import { selectAllEnigmas, maybeGetTimeSettings } from "../resources/selectors";
import { isFwHardwareValue } from "../devices/components/fbos_settings/board_type";

export const mapStateToProps = (props: Everything): MessagesProps => {
  const { hardware } = props.bot;
  const fbosConfig = validFbosConfig(getFbosConfig(props.resources.index));
  const sourceFbosConfig =
    sourceFbosConfigValue(fbosConfig, hardware.configuration);
  const apiFirmwareValue = sourceFbosConfig("firmware_hardware").value;
  const botAlerts = betterCompact(Object.values(props.bot.hardware.enigmas || {}));
  const apiAlerts = selectAllEnigmas(props.resources.index).map(x => x.body);
  const alerts =
    botAlerts.concat(DevSettings.futureFeaturesEnabled() ? apiAlerts : []);
  return {
    alerts,
    apiFirmwareValue: isFwHardwareValue(apiFirmwareValue)
      ? apiFirmwareValue : undefined,
    timeSettings: maybeGetTimeSettings(props.resources.index),
    dispatch: props.dispatch,
  };
};
