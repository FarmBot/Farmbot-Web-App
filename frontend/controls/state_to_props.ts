import { getWebAppConfigValue } from "../config_storage/actions";
import { Everything } from "../interfaces";
import { validFwConfig } from "../util";
import { getFirmwareConfig, getFbosConfig } from "../resources/getters";
import { getEnv } from "../farmware/state_to_props";
import {
  getFwHardwareValue,
} from "../settings/firmware/firmware_hardware_support";
import {
  selectAllWebcamFeeds, selectAllPeripherals, selectAllSequences,
} from "../resources/selectors";
import { uniq } from "lodash";
import { DesignerControlsProps } from "./interfaces";

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
    firmwareSettings: fwConfig || mcu_params,
    getConfigValue: getWebAppConfigValue(() => props),
    env: getEnv(props.resources.index),
    firmwareHardware: getFwHardwareValue(getFbosConfig(props.resources.index)),
  };
};
