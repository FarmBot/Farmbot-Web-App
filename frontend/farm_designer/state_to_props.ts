import { Everything } from "../interfaces";
import {
  selectAllGenericPointers,
  selectAllPlantPointers,
  selectAllCrops,
  joinToolsAndSlot,
  selectAllImages,
  maybeGetTimeOffset,
  selectAllPeripherals,
  selectAllPlantTemplates,
  selectAllSensorReadings,
  selectAllSensors,
  maybeGetDevice
} from "../resources/selectors";
import _ from "lodash";
import {
  validBotLocationData, validFwConfig, unpackUUID,
  shouldDisplay as shouldDisplayFunc,
  determineInstalledOsVersion
} from "../util";
import { getWebAppConfigValue } from "../config_storage/actions";
import { Props } from "./interfaces";
import { TaggedPlant } from "./map/interfaces";
import { RestResources } from "../resources/interfaces";
import { isString } from "lodash";
import { BooleanSetting } from "../session_keys";
import { Feature } from "../devices/interfaces";
import { reduceFarmwareEnv } from "../farmware/state_to_props";
import { getFirmwareConfig } from "../resources/getters";

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

  const { selectedPlants } = props.resources.consumers.farm_designer;
  const selectedPlant = selectedPlants
    ? findPlant(selectedPlants[0])
    : undefined;
  const { plantUUID } = props.resources.consumers.farm_designer.hoveredPlant;

  const hoveredPlant = findPlant(plantUUID);

  const getConfigValue = getWebAppConfigValue(() => props);
  const allPoints = selectAllGenericPointers(props.resources.index);
  const points = getConfigValue(BooleanSetting.show_historic_points)
    ? allPoints
    : allPoints.filter(x => !x.body.discarded_at);

  const fwConfig = validFwConfig(getFirmwareConfig(props.resources.index));
  const { mcu_params } = props.bot.hardware;
  const firmwareSettings = fwConfig || mcu_params;

  const { movement_step_per_mm_x, movement_step_per_mm_y } = firmwareSettings;

  const peripherals = _.uniq(selectAllPeripherals(props.resources.index))
    .map(x => {
      const label = x.body.label;
      const pinStatus = x.body.pin
        ? props.bot.hardware.pins[x.body.pin]
        : undefined;
      const value = pinStatus ? pinStatus.value > 0 : false;
      return { label, value };
    });

  const latestImages = _.chain(selectAllImages(props.resources.index))
    .sortBy(x => x.body.id)
    .reverse()
    .value();

  const installedOsVersion = determineInstalledOsVersion(
    props.bot, maybeGetDevice(props.resources.index));
  const shouldDisplay =
    shouldDisplayFunc(installedOsVersion, props.bot.minOsFeatureData);
  const env = shouldDisplay(Feature.api_farmware_env)
    ? reduceFarmwareEnv(props.resources.index)
    : props.bot.hardware.user_env;

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

  const sensorReadings = _.chain(selectAllSensorReadings(props.resources.index))
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
    points,
    toolSlots: joinToolsAndSlot(props.resources.index),
    hoveredPlant,
    plants,
    botLocationData: validBotLocationData(props.bot.hardware.location_data),
    botMcuParams: firmwareSettings,
    stepsPerMmXY: { x: movement_step_per_mm_x, y: movement_step_per_mm_y },
    peripherals,
    eStopStatus: props.bot.hardware.informational_settings.locked,
    latestImages,
    cameraCalibrationData,
    tzOffset: maybeGetTimeOffset(props.resources.index),
    getConfigValue,
    sensorReadings,
    sensors: selectAllSensors(props.resources.index),
  };
}
