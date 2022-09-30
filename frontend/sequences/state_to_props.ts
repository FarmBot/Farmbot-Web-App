import { Everything } from "../interfaces";
import { SequencesProps, HardwareFlags, FarmwareConfigs } from "./interfaces";
import { selectAllSequences, findSequence } from "../resources/selectors";
import { getStepTag } from "../resources/sequence_tagging";
import { enabledAxisMap } from "../settings/hardware_settings/axis_tracking_status";
import { validFwConfig } from "../util";
import { BooleanSetting } from "../session_keys";
import { getWebAppConfigValue } from "../config_storage/actions";
import { getFirmwareConfig } from "../resources/getters";
import { calculateAxialLengths } from "../controls/move/direction_axes_props";
import { mapStateToFolderProps } from "../folders/map_state_to_props";
import { generateFarmwareDictionary, getEnv } from "../farmware/state_to_props";
import {
  cameraDisabled, cameraCalibrated,
} from "../photos/capture_settings/camera_selection";

export function mapStateToProps(props: Everything): SequencesProps {
  const uuid = props.resources.consumers.sequences.current;
  const sequence = uuid ? findSequence(props.resources.index, uuid) : undefined;
  (sequence?.body.body || []).map(x => getStepTag(x));

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
      axisLength: calculateAxialLengths({ firmwareSettings }),
    };
  };
  const getConfig = getWebAppConfigValue(() => props);
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
    farmwareData: getFarmwareData(props),
    getWebAppConfigValue: getConfig,
    menuOpen: props.resources.consumers.sequences.menuOpen,
    stepIndex: props.resources.consumers.sequences.stepIndex,
    folderData: mapStateToFolderProps(props),
    visualized: !!props.resources.consumers.farm_designer.visualizedSequence,
    hoveredStep: props.resources.consumers.farm_designer.hoveredSequenceStep,
    sequencesPanelState: props.app.sequencesPanelState,
  };
}

const getFarmwareData = (props: Everything) => {
  const getConfig = getWebAppConfigValue(() => props);
  const farmwares =
    generateFarmwareDictionary(props.bot, props.resources.index, true);
  const farmwareNames = Object.values(farmwares).map(fw => fw.name);
  const { firstPartyFarmwareNames } = props.resources.consumers.farmware;

  const showFirstPartyFarmware =
    !!getConfig(BooleanSetting.show_first_party_farmware);

  const farmwareConfigs: FarmwareConfigs = {};
  Object.values(farmwares).map(fw => farmwareConfigs[fw.name] = fw.config);

  const env = getEnv(props.resources.index);

  return {
    farmwareNames,
    firstPartyFarmwareNames,
    showFirstPartyFarmware,
    farmwareConfigs,
    cameraDisabled: cameraDisabled(env),
    cameraCalibrated: cameraCalibrated(env),
  };
};
