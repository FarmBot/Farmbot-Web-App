import React from "react";
import { ThreeDGarden } from "../three_d_garden";
import {
  cameraOperationDurationMs, CameraOperation, Config, INITIAL,
  INITIAL_POSITION,
} from "../three_d_garden/config";
import { AxisNumberProperty, TaggedPlant } from "./map/interfaces";
import { BotPosition, BotState, UserEnv } from "../devices/interfaces";
import {
  McuParams, TaggedCurve, TaggedFarmwareEnv, TaggedGenericPointer,
  TaggedImage, TaggedLog, TaggedPoint,
  TaggedPointGroup, TaggedSensor, TaggedSensorReading, TaggedTool,
  TaggedDevice, TaggedFbosConfig, TaggedSequence, TaggedWeedPointer,
  TaggedPeripheral,
  TaggedSceneObject,
} from "farmbot";
import {
  CameraCalibrationData, DesignerState, ThreeDDesignerState,
} from "./interfaces";
import { GetWebAppConfigValue } from "../config_storage/actions";
import { BooleanSetting, NumericSetting } from "../session_keys";
import { ResourceIndex, SlotWithTool } from "../resources/interfaces";
import { calcSunCoordinate, ThreeDGardenPlant } from "../three_d_garden/garden";
import { findCropIcon, findCropMetadata } from "../crops/metadata";
import { PeripheralValues } from "./map/layers/farmbot/bot_trail";
import { isPeripheralActiveFunc } from "./map/layers/farmbot/bot_peripherals";
import { DeviceAccountSettings } from "farmbot/dist/resources/api_resources";
import {
  findOrCreate3DConfigFunction, get3DConfigValueFunction, SCENES, TEXTURES,
} from "../settings/three_d_settings";
import { get3DTime, latLng } from "../three_d_garden/time_travel";
import { parseCalibrationData } from "./map/layers/images/map_image";
import { fetchInterpolationOptions } from "./map/layers/points/interpolation_map";
import {
  perfCount, perfMark, usePerfRenderCount,
} from "../performance/perf";
import { MovementState, TimeSettings } from "../interfaces";
import { effectiveThreeDPerspective } from "./three_d_camera_controls";
import {
  createPanelCameraStore, PanelCameraStore,
} from "../three_d_garden/panel_camera";
import { isEqual, isNumber } from "lodash";
import { forceOnline } from "../devices/must_be_online";
import { envGet, prepopulateEnv } from "../photos/remote_env/selectors";
import { Actions } from "../constants";
import { soilHeightPoint } from "../points/soil_height_helpers";

export interface ThreeDGardenMapProps {
  gardenSize: AxisNumberProperty;
  resources: ResourceIndex;
  firmwareHardware: unknown;
  firmwareSettings: McuParams;
  gantryHeight: number;
  soilHeight: number;
  negativeZ: boolean;
  designer: DesignerState;
  plants: TaggedPlant[];
  dispatch: Function;
  getWebAppConfigValue: GetWebAppConfigValue;
  curves: TaggedCurve[];
  mapPoints: TaggedGenericPointer[];
  weeds: TaggedWeedPointer[];
  tools?: TaggedTool[];
  sequences?: TaggedSequence[];
  fbosConfig?: TaggedFbosConfig;
  timeSettings?: TimeSettings;
  botOnline?: boolean;
  arduinoBusy?: boolean;
  currentBotLocation?: BotPosition;
  movementState?: MovementState;
  defaultAxes?: string;
  noUTM?: boolean;
  deviceAccount?: TaggedDevice;
  bot?: BotState;
  botPosition: BotPosition;
  toolSlots?: SlotWithTool[];
  mountedToolName: string | undefined;
  peripheralValues: PeripheralValues;
  peripherals: TaggedPeripheral[];
  device: DeviceAccountSettings;
  allPoints: TaggedPoint[];
  groups: TaggedPointGroup[];
  images: TaggedImage[];
  sensorReadings: TaggedSensorReading[];
  sensors: TaggedSensor[];
  sceneObjects: TaggedSceneObject[];
  cameraCalibrationData: CameraCalibrationData;
  env: UserEnv;
  farmwareEnvs: TaggedFarmwareEnv[];
  logs: TaggedLog[];
}

const kitVersionFromFirmware = (firmwareHardware: unknown): string => {
  if (firmwareHardware == "farmduino_k19") { return "v1.9"; }
  if (firmwareHardware == "farmduino_k18") { return "v1.8"; }
  return "v1.7";
};

const localIdFromUuid = (uuid: string) => {
  const index = uuid.lastIndexOf(".");
  return parseInt(uuid.slice(index + 1), 10);
};

export const lastImageCaptureTime = (logs: TaggedLog[]): number => {
  let latest = 0;
  for (const log of logs) {
    if (!log.body.id && log.body.message === "Taking photo") {
      latest = Math.max(latest, localIdFromUuid(log.uuid));
    }
  }
  return latest;
};

const CAMERA_OPERATION_MESSAGES: Record<string, CameraOperation> = {
  "Calibrating camera": "calibration",
  "Executing Measure Soil Height": "soil-height",
  "Running weed detector": "weeds",
};

export interface LatestCameraOperation {
  type: CameraOperation;
  startedAt: number;
}

export const latestCameraOperation = (
  logs: TaggedLog[],
): LatestCameraOperation => {
  const latest: LatestCameraOperation = { type: "", startedAt: 0 };
  for (const log of logs) {
    const type = CAMERA_OPERATION_MESSAGES[log.body.message];
    if (!log.body.id && type) {
      const startedAt = localIdFromUuid(log.uuid);
      if (startedAt > latest.startedAt) {
        latest.type = type;
        latest.startedAt = startedAt;
      }
    }
  }
  return latest;
};

interface ThreeDGardenMapSceneProps extends
  Omit<ThreeDGardenMapProps, "designer"> {
  designer: ThreeDDesignerState;
  panelCameraStore: PanelCameraStore;
}

const createLiveBotPosition = (initial: BotPosition) => {
  let current = initial;
  return {
    value: {
      get x() { return current.x; },
      get y() { return current.y; },
      get z() { return current.z; },
    } as BotPosition,
    update: (next: BotPosition) => { current = next; },
  };
};

const ThreeDGardenMapSceneBase = (props: ThreeDGardenMapSceneProps) => {
  usePerfRenderCount("ThreeDGardenMap");
  const [botPositionStore] = React.useState(
    () => createLiveBotPosition(props.botPosition),
  );
  React.useLayoutEffect(() => {
    botPositionStore.update(props.botPosition);
  }, [botPositionStore, props.botPosition]);
  React.useEffect(() => {
    perfMark("three_d_map_mounted");
  }, []);
  const gridSize = props.gardenSize;
  const getValue = React.useMemo(
    () => get3DConfigValueFunction(props.farmwareEnvs),
    [props.farmwareEnvs],
  );
  const set3DConfigValue = React.useMemo(
    () => findOrCreate3DConfigFunction(
      props.dispatch,
      props.farmwareEnvs,
    ),
    [props.dispatch, props.farmwareEnvs],
  );
  const { designer } = props;
  const configValues = {
    mirrorX: getValue("mirrorX"),
    mirrorY: getValue("mirrorY"),
    bedXOffset: getValue("bedXOffset"),
    bedYOffset: getValue("bedYOffset"),
    bedZOffset: getValue("bedZOffset"),
    bedWallThickness: getValue("bedWallThickness"),
    bedHeight: getValue("bedHeight"),
    ccSupportSize: getValue("ccSupportSize"),
    beamLength: getValue("beamLength"),
    columnLength: getValue("columnLength"),
    zAxisLength: getValue("zAxisLength"),
    legSize: getValue("legSize"),
    legsFlush: getValue("legsFlush"),
    extraLegsX: getValue("extraLegsX"),
    extraLegsY: getValue("extraLegsY"),
    bedBrightness: getValue("bedBrightness"),
    soilBrightness: getValue("soilBrightness"),
    clouds: getValue("clouds"),
    constellations: getValue("constellations"),
    constellationsDebug: getValue("constellationsDebug"),
    laser: getValue("laser"),
    stats: getValue("stats"),
    threeAxes: getValue("threeAxes"),
    solar: getValue("solar"),
    lowDetail: getValue("lowDetail"),
    eventDebug: getValue("eventDebug"),
    cableDebug: getValue("cableDebug"),
    lightsDebug: getValue("lightsDebug"),
    moistureDebug: getValue("moistureDebug"),
    cameraFitDebug: getValue("cameraFitDebug"),
    viewCube: getValue("viewCube"),
    surfaceDebug: getValue("surfaceDebug"),
    sun: getValue("sun"),
    ambient: getValue("ambient"),
    heading: getValue("heading"),
    bounds: getValue("bounds"),
    grid: getValue("grid"),
    tracks: getValue("tracks"),
    cableCarriers: getValue("cableCarriers"),
    axes: getValue("axes"),
    xyDimensions: getValue("xyDimensions"),
    zDimension: getValue("zDimension"),
    urlCameraPos: getValue("urlCameraPos"),
    scene: getValue("scene"),
    ground: getValue("ground"),
    groundTexture: getValue("groundTexture"),
    people: getValue("people"),
    sunAzimuth: getValue("sunAzimuth"),
    sunInclination: getValue("sunInclination"),
  };
  const mirrorX = !!configValues.mirrorX;
  const mirrorY = !!configValues.mirrorY;
  const firmwareHardware = props.firmwareHardware;
  const zGantryOffset = props.gantryHeight;
  const soilHeight = Math.abs(props.soilHeight);
  const fallbackSoilZ = soilHeight == 0 ? 0 : -soilHeight;
  const rawSafeHeight = isNumber(props.fbosConfig?.body.safe_height)
    ? props.fbosConfig.body.safe_height
    : 0;
  const safeHeight = rawSafeHeight == 0 ? 0 : -Math.abs(rawSafeHeight);
  const measuredSoilZ = props.mapPoints
    .filter(soilHeightPoint)
    .map(point => point.body.z);
  const minSoilZ = measuredSoilZ.length > 0
    ? Math.min(...measuredSoilZ)
    : fallbackSoilZ;
  const maxSoilZ = measuredSoilZ.length > 0
    ? Math.max(...measuredSoilZ)
    : fallbackSoilZ;
  const displayTrail =
    !!props.getWebAppConfigValue(BooleanSetting.display_trail);
  const displayMotorLoad =
    !!props.getWebAppConfigValue(BooleanSetting.display_map_missed_steps);
  const animate =
    !props.getWebAppConfigValue(BooleanSetting.disable_animations);
  const cameraView =
    !!props.getWebAppConfigValue(BooleanSetting.show_camera_view_area);
  const cropImages =
    !!props.getWebAppConfigValue(BooleanSetting.crop_images);
  const clipImages =
    !!props.getWebAppConfigValue(BooleanSetting.clip_image_layer);
  const showUncroppedCameraView = !!props.getWebAppConfigValue(
    BooleanSetting.show_uncropped_camera_view_area);
  const rawEncoderVisible =
    !!props.getWebAppConfigValue(BooleanSetting.raw_encoders);
  const scaledEncoderVisible =
    !!props.getWebAppConfigValue(BooleanSetting.scaled_encoders);
  const encoderVisibility = React.useMemo(() => ({
    raw: rawEncoderVisible,
    scaled: scaledEncoderVisible,
  }), [rawEncoderVisible, scaledEncoderVisible]);
  const topDownAtStart =
    !!props.getWebAppConfigValue(BooleanSetting.top_down_view);
  const sceneObjects =
    !!props.getWebAppConfigValue(BooleanSetting.show_scene_objects);
  const controlsOverlay =
    !!props.getWebAppConfigValue(BooleanSetting.show_controls_overlay);
  const perspective = effectiveThreeDPerspective(
    designer,
  );
  const viewpointHeading = parseInt(
    "" + props.getWebAppConfigValue(NumericSetting.viewpoint_heading));
  const { latitude, longitude } = latLng(props.device);
  const isPeripheralActive = isPeripheralActiveFunc(props.peripheralValues);
  const waterFlow = isPeripheralActive("water");
  const light = isPeripheralActive("light");
  const vacuum = isPeripheralActive("vacuum");
  const rotary = (() => {
    const fwd = isPeripheralActive("rotary", "reverse");
    const rev = isPeripheralActive("reverse");
    if (rev && !fwd) { return -1; }
    if (fwd && !rev) { return 1; }
    return 0;
  })();
  const camCalData = React.useMemo(
    () => parseCalibrationData(props.cameraCalibrationData),
    [props.cameraCalibrationData]);
  const options = React.useMemo(
    () => fetchInterpolationOptions(props.farmwareEnvs),
    [props.farmwareEnvs]);

  const lastCaptureTime = React.useMemo(
    () => lastImageCaptureTime(props.logs),
    [props.logs]);
  const cameraOperation = React.useMemo(
    () => latestCameraOperation(props.logs),
    [props.logs]);
  const cameraOperationDuration = cameraOperationDurationMs(
    props.bot?.hardware.informational_settings.target,
    cameraOperation.type,
    forceOnline(),
  );
  const calibrationCardGrid = !!envGet(
    "CAMERA_CALIBRATION_easy_calibration",
    prepopulateEnv(props.env),
  );
  const sunPositionConfig = calcSunCoordinate(
    get3DTime(props.designer.threeDTime).toDate(),
    configValues.heading,
    latitude,
    longitude);
  const stableGridSize = React.useMemo(
    () => ({ x: gridSize.x, y: gridSize.y }),
    [gridSize.x, gridSize.y]);

  const config = React.useMemo(() => {
    const nextConfig = { ...INITIAL };
    nextConfig.botSizeX = stableGridSize.x;
    nextConfig.botSizeY = stableGridSize.y;
    nextConfig.bedWidthOuter = stableGridSize.y + 160;
    nextConfig.bedLengthOuter = stableGridSize.x + 280;
    nextConfig.zoomBeacons = false;
    nextConfig.trail = displayTrail;
    nextConfig.motorLoad = displayMotorLoad;
    nextConfig.animate = animate;
    nextConfig.cameraView = cameraView;
    nextConfig.cropImages = cropImages;
    nextConfig.clipImages = clipImages;
    nextConfig.showUncroppedCameraView = showUncroppedCameraView;
    nextConfig.kitVersion = kitVersionFromFirmware(firmwareHardware);
    nextConfig.negativeZ = props.negativeZ;
    nextConfig.exaggeratedZ = designer.threeDExaggeratedZ;
    nextConfig.mirrorX = mirrorX;
    nextConfig.mirrorY = mirrorY;
    nextConfig.bedXOffset = configValues.bedXOffset;
    nextConfig.bedYOffset = configValues.bedYOffset;
    nextConfig.bedZOffset = configValues.bedZOffset;
    nextConfig.distanceIndicator = designer.distanceIndicator;
    nextConfig.zGantryOffset = zGantryOffset;
    nextConfig.soilHeight = soilHeight;
    nextConfig.safeHeight = safeHeight;
    nextConfig.minSoilZ = minSoilZ;
    nextConfig.maxSoilZ = maxSoilZ;
    nextConfig.bedWallThickness = configValues.bedWallThickness;
    nextConfig.bedHeight = configValues.bedHeight;
    nextConfig.ccSupportSize = configValues.ccSupportSize;
    nextConfig.beamLength = configValues.beamLength;
    nextConfig.columnLength = configValues.columnLength;
    nextConfig.zAxisLength = configValues.zAxisLength;
    nextConfig.legSize = configValues.legSize;
    nextConfig.legsFlush = false;
    nextConfig.extraLegsX = configValues.extraLegsX;
    nextConfig.extraLegsY = configValues.extraLegsY;
    nextConfig.bedBrightness = configValues.bedBrightness;
    nextConfig.soilBrightness = configValues.soilBrightness;
    nextConfig.clouds = !!configValues.clouds;
    nextConfig.constellations = !!configValues.constellations;
    nextConfig.constellationsDebug = !!configValues.constellationsDebug;
    nextConfig.laser = !!configValues.laser;
    nextConfig.stats = !!configValues.stats;
    nextConfig.threeAxes = !!configValues.threeAxes;
    nextConfig.solar = !!configValues.solar;
    nextConfig.lowDetail = !!configValues.lowDetail;
    nextConfig.eventDebug = !!configValues.eventDebug;
    nextConfig.cableDebug = !!configValues.cableDebug;
    nextConfig.lightsDebug = !!configValues.lightsDebug;
    nextConfig.moistureDebug = !!configValues.moistureDebug;
    nextConfig.cameraFitDebug = !!configValues.cameraFitDebug;
    nextConfig.viewCube = !!configValues.viewCube;
    nextConfig.surfaceDebug = configValues.surfaceDebug;
    nextConfig.sun = configValues.sun;
    nextConfig.ambient = configValues.ambient;
    nextConfig.heading = configValues.heading;
    nextConfig.bounds = !!configValues.bounds;
    nextConfig.grid = !!configValues.grid;
    nextConfig.tracks = !!configValues.tracks;
    nextConfig.cableCarriers = !!configValues.cableCarriers;
    nextConfig.axes = !!configValues.axes;
    nextConfig.xyDimensions = !!configValues.xyDimensions;
    nextConfig.zDimension = !!configValues.zDimension;
    nextConfig.sceneObjects = sceneObjects;
    nextConfig.controlsOverlay = controlsOverlay;
    nextConfig.urlCameraPos = !!configValues.urlCameraPos;
    nextConfig.scene = SCENES[configValues.scene];
    nextConfig.ground = !!configValues.ground;
    nextConfig.groundTexture = TEXTURES[configValues.groundTexture];
    nextConfig.people = !!configValues.people;
    nextConfig.north = true;
    nextConfig.plants = "";
    nextConfig.sunAzimuth = sunPositionConfig.azimuth;
    nextConfig.sunInclination = sunPositionConfig.inclination;
    nextConfig.waterFlow = waterFlow;
    nextConfig.light = light;
    nextConfig.vacuum = vacuum;
    nextConfig.rotary = rotary;
    nextConfig.imgScale = camCalData.imageScale;
    nextConfig.imgRotation = camCalData.imageRotation;
    nextConfig.imgOffsetX = camCalData.imageOffsetX;
    nextConfig.imgOffsetY = camCalData.imageOffsetY;
    nextConfig.imgOrigin = camCalData.imageOrigin;
    nextConfig.imgCalZ = camCalData.calibrationZ;
    nextConfig.imgCenterX = camCalData.centerX;
    nextConfig.imgCenterY = camCalData.centerY;
    nextConfig.interpolationStepSize = options.stepSize;
    nextConfig.interpolationUseNearest = options.useNearest;
    nextConfig.interpolationPower = options.power;
    nextConfig.zoom = true;
    nextConfig.pan = true;
    nextConfig.rotate = true;
    nextConfig.perspective = perspective;
    nextConfig.viewpointHeading = viewpointHeading;
    nextConfig.cameraSelectionView = designer.threeDCameraSelection;
    nextConfig.lastImageCapture = lastCaptureTime;
    nextConfig.cameraOperation = cameraOperation.type;
    nextConfig.lastCameraOperation = cameraOperation.startedAt;
    nextConfig.cameraOperationDurationMs = cameraOperationDuration;
    nextConfig.calibrationCardGrid = calibrationCardGrid;
    return nextConfig;
  }, [
    animate,
    camCalData.calibrationZ,
    camCalData.centerX,
    camCalData.centerY,
    camCalData.imageOffsetX,
    camCalData.imageOffsetY,
    camCalData.imageOrigin,
    camCalData.imageRotation,
    camCalData.imageScale,
    cameraView,
    clipImages,
    cameraOperation.startedAt,
    cameraOperation.type,
    cameraOperationDuration,
    calibrationCardGrid,
    configValues.ambient,
    configValues.axes,
    configValues.beamLength,
    configValues.bedBrightness,
    configValues.bedHeight,
    configValues.bedWallThickness,
    configValues.bedXOffset,
    configValues.bedYOffset,
    configValues.bedZOffset,
    configValues.bounds,
    configValues.cableCarriers,
    configValues.cableDebug,
    configValues.cameraFitDebug,
    configValues.ccSupportSize,
    configValues.clouds,
    configValues.columnLength,
    configValues.constellations,
    configValues.constellationsDebug,
    configValues.eventDebug,
    configValues.extraLegsX,
    configValues.extraLegsY,
    configValues.grid,
    configValues.heading,
    configValues.laser,
    configValues.legSize,
    configValues.lightsDebug,
    configValues.lowDetail,
    configValues.moistureDebug,
    configValues.people,
    configValues.scene,
    configValues.ground,
    configValues.groundTexture,
    configValues.soilBrightness,
    configValues.solar,
    configValues.stats,
    configValues.sun,
    configValues.surfaceDebug,
    configValues.threeAxes,
    configValues.tracks,
    configValues.urlCameraPos,
    configValues.viewCube,
    configValues.xyDimensions,
    configValues.zAxisLength,
    configValues.zDimension,
    designer.distanceIndicator,
    designer.threeDCameraSelection,
    designer.threeDExaggeratedZ,
    cropImages,
    displayTrail,
    displayMotorLoad,
    firmwareHardware,
    lastCaptureTime,
    light,
    maxSoilZ,
    minSoilZ,
    mirrorX,
    mirrorY,
    options.power,
    options.stepSize,
    options.useNearest,
    props.negativeZ,
    rotary,
    soilHeight,
    safeHeight,
    showUncroppedCameraView,
    stableGridSize.x,
    stableGridSize.y,
    sunPositionConfig.azimuth,
    sunPositionConfig.inclination,
    perspective,
    vacuum,
    viewpointHeading,
    waterFlow,
    zGantryOffset,
    controlsOverlay,
    sceneObjects,
  ]);

  const position = React.useMemo(() => {
    const nextPosition = { ...INITIAL_POSITION };
    nextPosition.x = props.botPosition.x || 0;
    nextPosition.y = props.botPosition.y || 0;
    nextPosition.z = props.botPosition.z || 0;
    if (mirrorY) { nextPosition.y = stableGridSize.y - nextPosition.y; }
    if (mirrorX) { nextPosition.x = stableGridSize.x - nextPosition.x; }
    return nextPosition;
  }, [
    mirrorX,
    mirrorY,
    props.botPosition.x,
    props.botPosition.y,
    props.botPosition.z,
    stableGridSize.x,
    stableGridSize.y,
  ]);
  const threeDPlants = React.useMemo(() =>
    convertPlantResources(props.plants), [props.plants]);
  const addPlantProps = React.useMemo(() => ({
    gridSize: stableGridSize,
    botPosition: botPositionStore.value,
    dispatch: props.dispatch,
    getConfigValue: props.getWebAppConfigValue,
    curves: props.curves,
    designer: props.designer,
    topDownAtStart,
  }), [
    props.curves,
    props.designer,
    props.dispatch,
    props.getWebAppConfigValue,
    botPositionStore.value,
    stableGridSize,
    topDownAtStart,
  ]);

  return <ThreeDGarden
    config={config}
    resources={props.resources}
    configPosition={position}
    panelCameraStore={props.panelCameraStore}
    threeDPlants={threeDPlants}
    plants={props.plants}
    mapPoints={props.mapPoints}
    weeds={props.weeds}
    toolSlots={props.toolSlots}
    tools={props.tools}
    sequences={props.sequences}
    fbosConfig={props.fbosConfig}
    timeSettings={props.timeSettings}
    botOnline={props.botOnline}
    arduinoBusy={props.arduinoBusy}
    currentBotLocation={props.currentBotLocation}
    movementState={props.movementState}
    defaultAxes={props.defaultAxes}
    noUTM={props.noUTM}
    deviceAccount={props.deviceAccount}
    bot={props.bot}
    firmwareSettings={props.firmwareSettings}
    encoderVisibility={encoderVisibility}
    mountedToolName={props.mountedToolName}
    allPoints={props.allPoints}
    groups={props.groups}
    images={props.images}
    sensorReadings={props.sensorReadings}
    sensors={props.sensors}
    peripherals={props.peripherals}
    peripheralValues={props.peripheralValues}
    env={props.env}
    set3DConfigValue={set3DConfigValue}
    sceneObjects={props.sceneObjects}
    addPlantProps={addPlantProps} />;
};

const ThreeDGardenMapScene = React.memo(ThreeDGardenMapSceneBase);

ThreeDGardenMapScene.displayName = "ThreeDGardenMapScene";

const threeDDesignerState = (
  designer: DesignerState,
): ThreeDDesignerState => {
  const result: Partial<DesignerState> = { ...designer };
  delete result.panelOpen;
  return result as ThreeDDesignerState;
};

const reconcileSceneProps = (
  previous: ThreeDGardenMapSceneProps,
  next: ThreeDGardenMapSceneProps,
) => {
  const keys = Object.keys(next) as (keyof ThreeDGardenMapSceneProps)[];
  let changed = keys.length != Object.keys(previous).length;
  const entries = keys.map(key => {
    if (isEqual(previous[key], next[key])) {
      return [key, previous[key]];
    }
    perfCount(`change.ThreeDGardenMap.${key}`);
    changed = true;
    return [key, next[key]];
  });
  return changed
    ? Object.fromEntries(entries) as unknown as ThreeDGardenMapSceneProps
    : previous;
};

const useStableSceneProps = (
  value: ThreeDGardenMapSceneProps,
) => {
  const [stableValue, setStableValue] = React.useState(value);
  const reconciled = reconcileSceneProps(stableValue, value);
  if (reconciled != stableValue) {
    setStableValue(reconciled);
  }
  return reconciled;
};

export const ThreeDGardenMap = (props: ThreeDGardenMapProps) => {
  const { dispatch, designer } = props;
  const [panelCameraStore] = React.useState(
    () => createPanelCameraStore(designer.panelOpen),
  );
  React.useLayoutEffect(() => {
    panelCameraStore.setOpen(designer.panelOpen);
  }, [designer.panelOpen, panelCameraStore]);
  React.useEffect(() => {
    if (designer.panelOpen || !designer.gridPlanting) { return; }
    dispatch({
      type: Actions.SET_GRID_PLANTING,
      payload: undefined,
    });
  }, [
    designer.gridPlanting,
    designer.panelOpen,
    dispatch,
  ]);
  const sceneProps = useStableSceneProps({
    ...props,
    designer: threeDDesignerState(props.designer),
    panelCameraStore,
  });
  return <ThreeDGardenMapScene {...sceneProps} />;
};

const convertPlantResources = (plants: TaggedPlant[]): ThreeDGardenPlant[] =>
  plants.map(plant => {
    const crop = plantDisplayProps(plant.body.openfarm_slug);
    return {
      id: plant.body.id,
      label: plant.body.name,
      icon: crop.icon,
      size: plant.body.radius * 2,
      spread: crop.spread,
      x: plant.body.x,
      y: plant.body.y,
      key: "",
      seed: 0,
    };
  });

interface PlantDisplayProps {
  icon: string;
  spread: number;
}

const plantDisplayPropsBySlug: Record<string, PlantDisplayProps> = {};

const plantDisplayProps = (slug: string): PlantDisplayProps => {
  plantDisplayPropsBySlug[slug] ||= {
    icon: findCropIcon(slug),
    spread: findCropMetadata(slug).spread,
  };
  return plantDisplayPropsBySlug[slug];
};

export const convertPlants =
  (_config: Config, plants: TaggedPlant[]): ThreeDGardenPlant[] =>
    convertPlantResources(plants);
