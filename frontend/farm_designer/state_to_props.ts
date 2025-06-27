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
  selectAllToolSlotPointers,
  maybeGetSequence,
  selectAllLogs,
  selectAllTools,
  selectAllFarmwareEnvs,
  selectAllCurves,
} from "../resources/selectors";
import { validFwConfig, validFbosConfig } from "../util";
import { validBotLocationData } from "../util/location";
import { getWebAppConfigValue } from "../config_storage/actions";
import { FarmDesignerProps, CameraCalibrationData } from "./interfaces";
import { TaggedPlant, BotSize } from "./map/interfaces";
import { RestResources } from "../resources/interfaces";
import { isFinite, uniq, chain } from "lodash";
import { BooleanSetting } from "../session_keys";
import { getEnv } from "../farmware/state_to_props";
import { getFirmwareConfig, getFbosConfig } from "../resources/getters";
import { calcMicrostepsPerMm } from "../controls/move/direction_axes_props";
import { getBotSize } from "./map/util";
import { getDefaultAxisLength } from ".";
import {
  getFwHardwareValue, hasUTM,
} from "../settings/firmware/firmware_hardware_support";
import { isToolFlipped } from "../tools/tool_slot_edit_components";
import { UserEnv } from "../devices/interfaces";
import { sourceFbosConfigValue } from "../settings/source_config_value";

const plantFinder = (plants: TaggedPlant[]) =>
  (uuid: string | undefined): TaggedPlant =>
    plants.filter(x => x.uuid === uuid)[0];

export const getPlants = (resources: RestResources) => {
  const onlyPlants = selectAllPlantPointers(resources.index);
  const plantTemplates = selectAllPlantTemplates(resources.index);
  const { openedSavedGarden } = resources.consumers.farm_designer;
  return isFinite(openedSavedGarden)
    ? plantTemplates.filter(x =>
      x.body.saved_garden_id === openedSavedGarden)
    : onlyPlants;
};

export function mapStateToProps(props: Everything): FarmDesignerProps {
  const plants = getPlants(props.resources);
  const findPlant = plantFinder(plants);

  const { selectedPoints } = props.resources.consumers.farm_designer;
  const selectedPlant = selectedPoints ? findPlant(selectedPoints[0]) : undefined;

  const { plantUUID } = props.resources.consumers.farm_designer.hoveredPlant;
  const hoveredPlant = findPlant(plantUUID);

  const visualizedSequenceUUID =
    props.resources.consumers.farm_designer.visualizedSequence;
  const visualizedSequenceBody =
    maybeGetSequence(props.resources.index, visualizedSequenceUUID)?.body.body
    || [];

  const getConfigValue = getWebAppConfigValue(() => props);
  const allGenericPoints = selectAllGenericPointers(props.resources.index);
  const genericPoints = allGenericPoints;
  const allWeeds = selectAllWeedPointers(props.resources.index);
  const weeds = getConfigValue(BooleanSetting.show_historic_points)
    ? allWeeds
    : allWeeds.filter(x => x.body.plant_stage !== "removed");

  const fwConfig = validFwConfig(getFirmwareConfig(props.resources.index));
  const { hardware } = props.bot;
  const { mcu_params } = hardware;
  const firmwareSettings = fwConfig || mcu_params;
  const fbosConfig = validFbosConfig(getFbosConfig(props.resources.index));

  const device = getDeviceAccountSettings(props.resources.index).body;
  const mountedToolId = device.mounted_tool_id;
  const mountedToolName =
    maybeFindToolById(props.resources.index, mountedToolId)?.body.name;
  const mountedToolSlotInfo =
    selectAllToolSlotPointers(props.resources.index).filter(slot =>
      slot.body.tool_id == mountedToolId)[0]?.body;
  const firmwareHardware =
    getFwHardwareValue(getFbosConfig(props.resources.index));
  const mountedToolInfo = {
    name: mountedToolName,
    pulloutDirection: mountedToolSlotInfo?.pullout_direction,
    noUTM: !hasUTM(firmwareHardware),
    flipped: isToolFlipped(mountedToolSlotInfo?.meta),
  };

  const peripheralValues = uniq(selectAllPeripherals(props.resources.index))
    .map(x => {
      const label = x.body.label;
      const pinStatus = x.body.pin
        ? hardware.pins[x.body.pin]
        : undefined;
      const value = pinStatus ? pinStatus.value > 0 : false;
      return { label, value };
    });

  const latestImages = chain(selectAllImages(props.resources.index))
    .sortBy(x => x.body.id)
    .reverse()
    .value();

  const env = getEnv(props.resources.index);

  const sensorReadings = chain(selectAllSensorReadings(props.resources.index))
    .sortBy(x => x.body.created_at)
    .reverse()
    .take(500)
    .reverse()
    .value();

  return {
    crops: selectAllCrops(props.resources.index),
    dispatch: props.dispatch,
    device,
    selectedPlant,
    designer: props.resources.consumers.farm_designer,
    genericPoints,
    weeds,
    allPoints: selectAllPoints(props.resources.index),
    tools: selectAllTools(props.resources.index),
    toolSlots: joinToolsAndSlot(props.resources.index),
    hoveredPlant,
    plants,
    botLocationData: validBotLocationData(hardware.location_data),
    botMcuParams: firmwareSettings,
    botSize: botSize(props),
    peripheralValues,
    eStopStatus: hardware.informational_settings.locked,
    deviceTarget: hardware.informational_settings.target,
    latestImages,
    cameraCalibrationData: getCameraCalibrationData(env),
    timeSettings: maybeGetTimeSettings(props.resources.index),
    getConfigValue,
    sensorReadings,
    sensors: selectAllSensors(props.resources.index),
    groups: selectAllPointGroups(props.resources.index),
    mountedToolInfo,
    visualizedSequenceBody,
    logs: selectAllLogs(props.resources.index),
    sourceFbosConfig: sourceFbosConfigValue(fbosConfig, hardware.configuration),
    farmwareEnvs: selectAllFarmwareEnvs(props.resources.index),
    curves: selectAllCurves(props.resources.index),
  };
}

export const getCameraCalibrationData =
  (env: UserEnv): CameraCalibrationData => ({
    scale: env["CAMERA_CALIBRATION_coord_scale"],
    rotation: env["CAMERA_CALIBRATION_total_rotation_angle"],
    offset: {
      x: env["CAMERA_CALIBRATION_camera_offset_x"],
      y: env["CAMERA_CALIBRATION_camera_offset_y"],
    },
    center: {
      x: env["CAMERA_CALIBRATION_center_pixel_location_x"],
      y: env["CAMERA_CALIBRATION_center_pixel_location_y"],
    },
    origin: env["CAMERA_CALIBRATION_image_bot_origin_location"],
    calibrationZ: env["CAMERA_CALIBRATION_camera_z"],
  });

export const botSize = (props: Everything): BotSize => {
  const getConfigValue = getWebAppConfigValue(() => props);
  const fwConfig = validFwConfig(getFirmwareConfig(props.resources.index));
  const { mcu_params } = props.bot.hardware;
  const firmwareSettings = fwConfig || mcu_params;
  const fw = firmwareSettings;
  const stepsPerMm = {
    x: calcMicrostepsPerMm(fw.movement_step_per_mm_x, fw.movement_microsteps_x),
    y: calcMicrostepsPerMm(fw.movement_step_per_mm_y, fw.movement_microsteps_y),
    z: calcMicrostepsPerMm(fw.movement_step_per_mm_z, fw.movement_microsteps_z),
  };
  return getBotSize(
    firmwareSettings,
    stepsPerMm,
    getDefaultAxisLength(getConfigValue));
};
