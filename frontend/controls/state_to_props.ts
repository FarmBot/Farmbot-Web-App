import { getWebAppConfigValue } from "../config_storage/actions";
import { Everything } from "../interfaces";
import { validFwConfig } from "../util";
import { getFirmwareConfig, getFbosConfig } from "../resources/getters";
import { getEnv } from "../farmware/state_to_props";
import {
  getFwHardwareValue,
} from "../settings/firmware/firmware_hardware_support";
import {
  selectAllWebcamFeeds, selectAllPeripherals, selectAllSequences, selectAllLogs,
} from "../resources/selectors";
import { uniq } from "lodash";
import { DesignerControlsProps } from "./interfaces";
import { apiPinBindings } from "../settings/pin_bindings/pin_bindings_content";
import { sourceFwConfigValue } from "../settings/source_config_value";

export const mapStateToProps = (props: Everything): DesignerControlsProps => {
  const fwConfig = validFwConfig(getFirmwareConfig(props.resources.index));
  const { mcu_params } = props.bot.hardware;
  return {
    feeds: selectAllWebcamFeeds(props.resources.index),
    dispatch: props.dispatch,
    bot: props.bot,
    peripherals: uniq(selectAllPeripherals(props.resources.index)),
    sequences: selectAllSequences(props.resources.index),
    resources: props.resources.index,
    menuOpen: props.resources.consumers.sequences.menuOpen,
    movementState: props.app.movement,
    firmwareSettings: fwConfig || mcu_params,
    getConfigValue: getWebAppConfigValue(() => props),
    sourceFwConfig: sourceFwConfigValue(validFwConfig(getFirmwareConfig(
      props.resources.index)), props.bot.hardware.mcu_params),
    env: getEnv(props.resources.index),
    firmwareHardware: getFwHardwareValue(getFbosConfig(props.resources.index)),
    pinBindings: apiPinBindings(props.resources.index),
    logs: selectAllLogs(props.resources.index),
  };
};
