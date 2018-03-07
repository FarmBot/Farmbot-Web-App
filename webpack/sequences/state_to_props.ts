import { Everything } from "../interfaces";
import { Props, HardwareFlags } from "./interfaces";
import {
  selectAllSequences,
  findSequence,
  maybeGetDevice
} from "../resources/selectors";
import { getStepTag } from "../resources/sequence_tagging";
import { enabledAxisMap } from "../devices/components/axis_tracking_status";
import { betterCompact, semverCompare, SemverResult } from "../util";
import { isUndefined } from "lodash";
import { getWebAppConfig } from "../resources/config_selectors";

export function mapStateToProps(props: Everything): Props {
  const uuid = props.resources.consumers.sequences.current;
  const sequence = uuid ? findSequence(props.resources.index, uuid) : undefined;
  sequence && (sequence.body.body || []).map(x => getStepTag(x));

  const hardwareFlags = (): HardwareFlags => {
    const { mcu_params } = props.bot.hardware;
    return {
      findHomeEnabled: enabledAxisMap(mcu_params),
      stopAtHome: {
        x: !!mcu_params.movement_stop_at_home_x,
        y: !!mcu_params.movement_stop_at_home_y,
        z: !!mcu_params.movement_stop_at_home_z
      },
      stopAtMax: {
        x: !!mcu_params.movement_stop_at_max_x,
        y: !!mcu_params.movement_stop_at_max_y,
        z: !!mcu_params.movement_stop_at_max_z
      },
      negativeOnly: {
        x: !!mcu_params.movement_home_up_x,
        y: !!mcu_params.movement_home_up_y,
        z: !!mcu_params.movement_home_up_z
      },
      axisLength: {
        x: (mcu_params.movement_axis_nr_steps_x || 0)
          / (mcu_params.movement_step_per_mm_x || 1),
        y: (mcu_params.movement_axis_nr_steps_y || 0)
          / (mcu_params.movement_step_per_mm_y || 1),
        z: (mcu_params.movement_axis_nr_steps_z || 0)
          / (mcu_params.movement_step_per_mm_z || 1)
      },
    };
  };

  const { farmwares } = props.bot.hardware.process_info;
  const farmwareNames = betterCompact(Object
    .keys(farmwares)
    .map(x => farmwares[x]))
    .map(fw => fw.name);
  const { firstPartyFarmwareNames } = props.resources.consumers.farmware;
  const conf = getWebAppConfig(props.resources.index);
  const showFirstPartyFarmware = !!(conf && conf.body.show_first_party_farmware);

  const installedOsVersion = (): string | undefined => {
    const fromBotState = props.bot.hardware
      .informational_settings.controller_version;
    const device = maybeGetDevice(props.resources.index);
    const fromAPI = device ? device.body.fbos_version : undefined;
    if (isUndefined(fromBotState) && isUndefined(fromAPI)) { return undefined; }
    switch (semverCompare(fromBotState || "", fromAPI || "")) {
      case SemverResult.LEFT_IS_GREATER:
      case SemverResult.EQUAL:
        return fromBotState === "" ? undefined : fromBotState;
      case SemverResult.RIGHT_IS_GREATER:
        return fromAPI === "" ? undefined : fromAPI;
      default:
        return undefined;
    }
  };

  return {
    dispatch: props.dispatch,
    sequences: selectAllSequences(props.resources.index),
    sequence: sequence,
    auth: props.auth,
    resources: props.resources.index,
    syncStatus: (props
      .bot
      .hardware
      .informational_settings
      .sync_status || "unknown"),
    consistent: props.bot.consistent,
    autoSyncEnabled: !!props.bot.hardware.configuration.auto_sync,
    hardwareFlags: hardwareFlags(),
    farmwareInfo: {
      farmwareNames,
      firstPartyFarmwareNames,
      showFirstPartyFarmware
    },
    installedOsVersion: installedOsVersion(),
  };
}
