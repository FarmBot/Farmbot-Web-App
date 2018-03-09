import { Everything } from "../interfaces";
import {
  selectAllGenericPointers,
  selectAllPlantPointers,
  selectAllCrops,
  joinToolsAndSlot,
  selectAllImages,
  maybeGetTimeOffset,
  selectAllPeripherals
} from "../resources/selectors";
import { StepsPerMmXY } from "../devices/interfaces";
import { isNumber } from "lodash";
import * as _ from "lodash";
import { minFwVersionCheck, validBotLocationData } from "../util";
import { getWebAppConfigValue } from "../config_storage/actions";

export function mapStateToProps(props: Everything) {

  const plants = selectAllPlantPointers(props.resources.index);
  const maybeSelectedPlants = props.resources.consumers.farm_designer.selectedPlants;
  const selectedPlant = maybeSelectedPlants
    ? plants.filter(x => x.uuid === maybeSelectedPlants[0])[0]
    : undefined;
  const { plantUUID } = props.resources.consumers.farm_designer.hoveredPlant;
  const hoveredPlant = plants.filter(x => x.uuid === plantUUID)[0];

  function stepsPerMmXY(): StepsPerMmXY {
    const {
      mcu_params, configuration, informational_settings
    } = props.bot.hardware;
    const { steps_per_mm_x, steps_per_mm_y } = configuration;
    const { firmware_version } = informational_settings;
    const { movement_step_per_mm_x, movement_step_per_mm_y } = mcu_params;
    const stepsPerMm = () => {
      if (minFwVersionCheck(firmware_version, "5.0.5")) {
        return { x: movement_step_per_mm_x, y: movement_step_per_mm_y };
      } else {
        return { x: steps_per_mm_x, y: steps_per_mm_y };
      }
    };
    if (isNumber(stepsPerMm().x) && isNumber(stepsPerMm().y)) {
      return stepsPerMm();
    }
    return { x: undefined, y: undefined };
  }

  const peripherals = _.uniq(selectAllPeripherals(props.resources.index))
    .map(x => {
      const label = x.body.label;
      const pinStatus = x.body.pin
        ? props.bot.hardware.pins[x.body.pin]
        : undefined;
      const value = pinStatus ? pinStatus.value > 0 : false;
      return { label, value };
    });

  const latestImages = _(selectAllImages(props.resources.index))
    .sortBy(x => x.body.id)
    .reverse()
    .value();

  const { user_env } = props.bot.hardware;
  const cameraCalibrationData = {
    scale: user_env["CAMERA_CALIBRATION_coord_scale"],
    rotation: user_env["CAMERA_CALIBRATION_total_rotation_angle"],
    offset: {
      x: user_env["CAMERA_CALIBRATION_camera_offset_x"],
      y: user_env["CAMERA_CALIBRATION_camera_offset_y"]
    },
    origin: user_env["CAMERA_CALIBRATION_image_bot_origin_location"],
    calibrationZ: user_env["CAMERA_CALIBRATION_camera_z"],
  };

  return {
    crops: selectAllCrops(props.resources.index),
    dispatch: props.dispatch,
    selectedPlant,
    zoomLevel: 1,
    designer: props.resources.consumers.farm_designer,
    points: selectAllGenericPointers(props.resources.index),
    toolSlots: joinToolsAndSlot(props.resources.index),
    hoveredPlant,
    plants,
    botLocationData: validBotLocationData(props.bot.hardware.location_data),
    botMcuParams: props.bot.hardware.mcu_params,
    stepsPerMmXY: stepsPerMmXY(),
    peripherals,
    eStopStatus: props.bot.hardware.informational_settings.locked,
    latestImages,
    cameraCalibrationData,
    tzOffset: maybeGetTimeOffset(props.resources.index),
    getConfigValue: getWebAppConfigValue(() => props),
  };
}
