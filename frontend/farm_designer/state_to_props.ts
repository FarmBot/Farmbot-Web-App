import { Everything } from "../interfaces";
import {
  selectAllGenericPointers,
  selectAllPlantPointers,
  selectAllCrops,
  joinToolsAndSlot,
  selectAllImages,
  selectAllPeripherals,
  selectAllPlantTemplates,
  selectAllSensorReadings,
  selectAllSensors,
  maybeGetTimeSettings,
  selectAllPoints,
  selectAllPointGroups,
  getDeviceAccountSettings,
  maybeFindToolById,
  selectAllWeedPointers,
} from "../resources/selectors";
import { validBotLocationData, validFwConfig, unpackUUID } from "../util";
import { getWebAppConfigValue } from "../config_storage/actions";
import { Props } from "./interfaces";
import { TaggedPlant } from "./map/interfaces";
import { RestResources } from "../resources/interfaces";
import { isString, uniq, chain } from "lodash";
import { BooleanSetting } from "../session_keys";
import { getEnv, getShouldDisplayFn } from "../farmware/state_to_props";
import { getFirmwareConfig } from "../resources/getters";
import { calcMicrostepsPerMm } from "../controls/move/direction_axes_props";

const plantFinder = (plants: TaggedPlant[]) =>
  (uuid: string | undefined): TaggedPlant =>
    plants.filter(x => x.uuid === uuid)[0];

export const getPlants = (resources: RestResources) => {
  const onlyPlants = selectAllPlantPointers(resources.index);
  const plantTemplates = selectAllPlantTemplates(resources.index);
  const { openedSavedGarden } = resources.consumers.farm_designer;
  return isString(openedSavedGarden)
    ? plantTemplates.filter(x =>
      x.body.saved_garden_id === unpackUUID(openedSavedGarden).remoteId)
    : onlyPlants;
};

export function mapStateToProps(props: Everything): Props {
  const plants = getPlants(props.resources);
  const findPlant = plantFinder(plants);

  const { selectedPoints } = props.resources.consumers.farm_designer;
  const selectedPlant = selectedPoints ? findPlant(selectedPoints[0]) : undefined;

  const { plantUUID } = props.resources.consumers.farm_designer.hoveredPlant;
  const hoveredPlant = findPlant(plantUUID);

  const getConfigValue = getWebAppConfigValue(() => props);
  const allGenericPoints = selectAllGenericPointers(props.resources.index);
  const genericPoints = getConfigValue(BooleanSetting.show_historic_points)
    ? allGenericPoints
    : allGenericPoints.filter(x => !x.body.discarded_at);
  const weeds = selectAllWeedPointers(props.resources.index);

  const fwConfig = validFwConfig(getFirmwareConfig(props.resources.index));
  const { mcu_params } = props.bot.hardware;
  const firmwareSettings = fwConfig || mcu_params;

  const fw = firmwareSettings;
  const stepsPerMmXY = {
    x: calcMicrostepsPerMm(fw.movement_step_per_mm_x, fw.movement_microsteps_x),
    y: calcMicrostepsPerMm(fw.movement_step_per_mm_y, fw.movement_microsteps_y),
  };

  const mountedToolId =
    getDeviceAccountSettings(props.resources.index).body.mounted_tool_id;
  const mountedToolName =
    maybeFindToolById(props.resources.index, mountedToolId)?.body.name;

  const peripherals = uniq(selectAllPeripherals(props.resources.index))
    .map(x => {
      const label = x.body.label;
      const pinStatus = x.body.pin
        ? props.bot.hardware.pins[x.body.pin]
        : undefined;
      const value = pinStatus ? pinStatus.value > 0 : false;
      return { label, value };
    });

  const latestImages = chain(selectAllImages(props.resources.index))
    .sortBy(x => x.body.id)
    .reverse()
    .value();

  const shouldDisplay = getShouldDisplayFn(props.resources.index, props.bot);
  const env = getEnv(props.resources.index, shouldDisplay, props.bot);

  const cameraCalibrationData = {
    scale: env["CAMERA_CALIBRATION_coord_scale"],
    rotation: env["CAMERA_CALIBRATION_total_rotation_angle"],
    offset: {
      x: env["CAMERA_CALIBRATION_camera_offset_x"],
      y: env["CAMERA_CALIBRATION_camera_offset_y"]
    },
    origin: env["CAMERA_CALIBRATION_image_bot_origin_location"],
    calibrationZ: env["CAMERA_CALIBRATION_camera_z"],
  };

  const sensorReadings = chain(selectAllSensorReadings(props.resources.index))
    .sortBy(x => x.body.created_at)
    .reverse()
    .take(500)
    .reverse()
    .value();

  return {
    crops: selectAllCrops(props.resources.index),
    dispatch: props.dispatch,
    selectedPlant,
    designer: props.resources.consumers.farm_designer,
    genericPoints,
    weeds,
    allPoints: selectAllPoints(props.resources.index),
    toolSlots: joinToolsAndSlot(props.resources.index),
    hoveredPlant,
    plants,
    botLocationData: validBotLocationData(props.bot.hardware.location_data),
    botMcuParams: firmwareSettings,
    stepsPerMmXY,
    peripherals,
    eStopStatus: props.bot.hardware.informational_settings.locked,
    latestImages,
    cameraCalibrationData,
    timeSettings: maybeGetTimeSettings(props.resources.index),
    getConfigValue,
    sensorReadings,
    sensors: selectAllSensors(props.resources.index),
    groups: selectAllPointGroups(props.resources.index),
    shouldDisplay,
    mountedToolName,
  };
}
