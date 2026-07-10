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
  selectAllSequences,
  selectAllFarmwareEnvs,
  selectAllCurves,
  selectAllSceneObjects,
} from "../resources/selectors";
import { validFwConfig, validFbosConfig } from "../util";
import { validBotLocationData } from "../util/location";
import {
  getWebAppConfigValue,
  getWebAppConfigValueFromResources,
} from "../config_storage/actions";
import { FarmDesignerProps, CameraCalibrationData } from "./interfaces";
import { TaggedPlant, BotSize } from "./map/interfaces";
import { RestResources } from "../resources/interfaces";
import { isFinite, chain } from "lodash";
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
import { isBotOnlineFromState } from "../devices/must_be_online";
import { validGoButtonAxes } from "./move_to";
import { selectPeripheralValues } from "./peripheral_values";

const plantFinder = (plants: TaggedPlant[]) =>
  (uuid: string | undefined): TaggedPlant =>
    plants.filter(x => x.uuid === uuid)[0];

const memoizeLast = <Args extends unknown[], Result>(
  fn: (...args: Args) => Result,
) => {
  let lastArgs: Args | undefined;
  let lastResult: Result;
  return (...args: Args): Result => {
    if (lastArgs && args.every((arg, index) => arg === lastArgs?.[index])) {
      return lastResult;
    }
    lastArgs = args;
    lastResult = fn(...args);
    return lastResult;
  };
};

const selectCrops = memoizeLast(selectAllCrops);
const selectGenericPoints = memoizeLast(selectAllGenericPointers);
const selectWeedPointers = memoizeLast(selectAllWeedPointers);
const selectVisibleWeeds = memoizeLast(
  (allWeeds: ReturnType<typeof selectAllWeedPointers>, showHistoric: boolean) =>
    showHistoric
      ? allWeeds
      : allWeeds.filter(x => x.body.plant_stage !== "removed"));
const selectPointGroups = memoizeLast(selectAllPointGroups);
const selectPoints = memoizeLast(selectAllPoints);
const selectTools = memoizeLast(selectAllTools);
const selectToolSlots = memoizeLast(joinToolsAndSlot);
const selectSequences = memoizeLast(selectAllSequences);
const selectPeripherals = memoizeLast(selectAllPeripherals);
const selectImages = memoizeLast((index: RestResources["index"]) =>
  chain(selectAllImages(index))
    .sortBy(x => x.body.id)
    .reverse()
    .value());
const selectSensorReadings = memoizeLast((index: RestResources["index"]) =>
  chain(selectAllSensorReadings(index))
    .sortBy(x => x.body.created_at)
    .reverse()
    .take(500)
    .reverse()
    .value());
const selectSensors = memoizeLast(selectAllSensors);
const selectSceneObjects = memoizeLast(selectAllSceneObjects);
const selectLogs = memoizeLast(selectAllLogs);
const selectFarmwareEnvs = memoizeLast(selectAllFarmwareEnvs);
const selectCurves = memoizeLast(selectAllCurves);
const selectTimeSettings = memoizeLast(maybeGetTimeSettings);
const selectEnv = memoizeLast(getEnv);
const selectCameraCalibrationData = memoizeLast(
  (env: UserEnv) => getCameraCalibrationData(env));
const selectGetConfigValue = memoizeLast(getWebAppConfigValueFromResources);
const selectPlantsForDesigner = memoizeLast((
  resources: RestResources,
  openedSavedGarden: number | undefined,
) => {
  const onlyPlants = selectAllPlantPointers(resources.index);
  const plantTemplates = selectAllPlantTemplates(resources.index);
  return isFinite(openedSavedGarden)
    ? plantTemplates.filter(x =>
      x.body.saved_garden_id === openedSavedGarden)
    : onlyPlants;
});

export const getPlants = (resources: RestResources) => {
  const { openedSavedGarden } = resources.consumers.farm_designer;
  return selectPlantsForDesigner(resources, openedSavedGarden);
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

  const getConfigValue = selectGetConfigValue(props.resources.index);
  const allGenericPoints = selectGenericPoints(props.resources.index);
  const genericPoints = allGenericPoints;
  const allWeeds = selectWeedPointers(props.resources.index);
  const weeds = selectVisibleWeeds(
    allWeeds,
    !!getConfigValue(BooleanSetting.show_historic_points));

  const fwConfig = validFwConfig(getFirmwareConfig(props.resources.index));
  const { hardware } = props.bot;
  const { mcu_params } = hardware;
  const firmwareSettings = fwConfig || mcu_params;
  const taggedFbosConfig = getFbosConfig(props.resources.index);
  const fbosConfig = validFbosConfig(taggedFbosConfig);

  const deviceAccount = getDeviceAccountSettings(props.resources.index);
  const device = deviceAccount.body;
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

  const groups = selectPointGroups(props.resources.index);
  const allPoints = selectPoints(props.resources.index);

  const peripherals = selectPeripherals(props.resources.index);
  const peripheralValues = selectPeripheralValues(peripherals, hardware.pins);

  const latestImages = selectImages(props.resources.index);

  const env = selectEnv(props.resources.index);

  const sensorReadings = selectSensorReadings(props.resources.index);

  return {
    crops: selectCrops(props.resources.index),
    dispatch: props.dispatch,
    device,
    deviceAccount,
    bot: props.bot,
    selectedPlant,
    designer: props.resources.consumers.farm_designer,
    genericPoints,
    weeds,
    allPoints,
    tools: selectTools(props.resources.index),
    sequences: selectSequences(props.resources.index),
    fbosConfig: taggedFbosConfig,
    toolSlots: selectToolSlots(props.resources.index),
    hoveredPlant,
    plants,
    botLocationData: validBotLocationData(hardware.location_data),
    botMcuParams: firmwareSettings,
    botSize: botSize(props),
    peripheralValues,
    peripherals,
    eStopStatus: hardware.informational_settings.locked,
    deviceTarget: hardware.informational_settings.target,
    latestImages,
    cameraCalibrationData: selectCameraCalibrationData(env),
    timeSettings: selectTimeSettings(props.resources.index),
    botOnline: isBotOnlineFromState(props.bot),
    arduinoBusy: hardware.informational_settings.busy,
    currentBotLocation: validBotLocationData(hardware.location_data).position,
    movementState: props.app.movement,
    defaultAxes: validGoButtonAxes(getConfigValue),
    getConfigValue,
    sensorReadings,
    sensors: selectSensors(props.resources.index),
    groups,
    mountedToolInfo,
    visualizedSequenceBody,
    logs: selectLogs(props.resources.index),
    sourceFbosConfig: sourceFbosConfigValue(fbosConfig, hardware.configuration),
    env,
    farmwareEnvs: selectFarmwareEnvs(props.resources.index),
    curves: selectCurves(props.resources.index),
    sceneObjects: selectSceneObjects(props.resources.index),
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
