import { Everything } from "../interfaces";
import { Props, HardwareFlags, FarmwareConfigs } from "./interfaces";
import {
  selectAllSequences, findSequence, maybeGetDevice
} from "../resources/selectors";
import { getStepTag } from "../resources/sequence_tagging";
import { enabledAxisMap } from "../devices/components/axis_tracking_status";
import {
  shouldDisplay, determineInstalledOsVersion, validFwConfig
} from "../util";
import { BooleanSetting } from "../session_keys";
import { getWebAppConfigValue } from "../config_storage/actions";
import { getFirmwareConfig, getWebAppConfig } from "../resources/getters";
import { Farmwares } from "../farmware/interfaces";
import { manifestInfo } from "../farmware/generate_manifest_info";

export function mapStateToProps(props: Everything): Props {
  const uuid = props.resources.consumers.sequences.current;
  const sequence = uuid ? findSequence(props.resources.index, uuid) : undefined;
  sequence && (sequence.body.body || []).map(x => getStepTag(x));

  const fwConfig = validFwConfig(getFirmwareConfig(props.resources.index));
  const { mcu_params } = props.bot.hardware;
  const firmwareSettings = fwConfig || mcu_params;
  const hardwareFlags = (): HardwareFlags => {
    return {
      findHomeEnabled: enabledAxisMap(firmwareSettings),
      stopAtHome: {
        x: !!firmwareSettings.movement_stop_at_home_x,
        y: !!firmwareSettings.movement_stop_at_home_y,
        z: !!firmwareSettings.movement_stop_at_home_z
      },
      stopAtMax: {
        x: !!firmwareSettings.movement_stop_at_max_x,
        y: !!firmwareSettings.movement_stop_at_max_y,
        z: !!firmwareSettings.movement_stop_at_max_z
      },
      negativeOnly: {
        x: !!firmwareSettings.movement_home_up_x,
        y: !!firmwareSettings.movement_home_up_y,
        z: !!firmwareSettings.movement_home_up_z
      },
      axisLength: {
        x: (firmwareSettings.movement_axis_nr_steps_x || 0)
          / (firmwareSettings.movement_step_per_mm_x || 1),
        y: (firmwareSettings.movement_axis_nr_steps_y || 0)
          / (firmwareSettings.movement_step_per_mm_y || 1),
        z: (firmwareSettings.movement_axis_nr_steps_z || 0)
          / (firmwareSettings.movement_step_per_mm_z || 1)
      },
    };
  };

  const botStateFarmwares = props.bot.hardware.process_info.farmwares;
  const farmwares: Farmwares = {};
  Object.values(botStateFarmwares).map((fm: unknown) => {
    const info = manifestInfo(fm);
    farmwares[info.name] = manifestInfo(fm);
  });
  const farmwareNames = Object.values(farmwares).map(fw => fw.name);
  const { firstPartyFarmwareNames } = props.resources.consumers.farmware;
  const conf = getWebAppConfig(props.resources.index);
  const showFirstPartyFarmware = !!(conf && conf.body.show_first_party_farmware);
  const farmwareConfigs: FarmwareConfigs = {};
  Object.values(farmwares).map(fw => farmwareConfigs[fw.name] = fw.config);

  const installedOsVersion = determineInstalledOsVersion(
    props.bot, maybeGetDevice(props.resources.index));

  const confirmStepDeletion =
    !!getWebAppConfigValue(() => props)(BooleanSetting.confirm_step_deletion);

  return {
    dispatch: props.dispatch,
    sequences: selectAllSequences(props.resources.index),
    sequence: sequence,
    resources: props.resources.index,
    syncStatus: (props
      .bot
      .hardware
      .informational_settings
      .sync_status || "unknown"),
    hardwareFlags: hardwareFlags(),
    farmwareInfo: {
      farmwareNames,
      firstPartyFarmwareNames,
      showFirstPartyFarmware,
      farmwareConfigs,
    },
    shouldDisplay: shouldDisplay(installedOsVersion, props.bot.minOsFeatureData),
    confirmStepDeletion,
    menuOpen: props.resources.consumers.sequences.menuOpen,
  };
}
