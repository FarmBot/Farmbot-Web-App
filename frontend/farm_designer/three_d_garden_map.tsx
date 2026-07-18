import React from "react";
import { ThreeDGarden } from "../three_d_garden";
import { Config, INITIAL, INITIAL_POSITION } from "../three_d_garden/config";
import { AxisNumberProperty, TaggedPlant } from "./map/interfaces";
import { BotPosition, BotState, UserEnv } from "../devices/interfaces";
import {
  TaggedCurve, TaggedFarmwareEnv, TaggedGenericPointer,
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
import { SlotWithTool } from "../resources/interfaces";
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
import { isEqual } from "lodash";

export interface ThreeDGardenMapProps {
  gardenSize: AxisNumberProperty;
  firmwareHardware: unknown;
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

interface ThreeDGardenMapSceneProps extends
  Omit<ThreeDGardenMapProps, "designer"> {
  designer: ThreeDDesignerState;
  panelCameraStore: PanelCameraStore;
}

const ThreeDGardenMapSceneBase = (props: ThreeDGardenMapSceneProps) => {
  usePerfRenderCount("ThreeDGardenMap");
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
  const displayTrail =
    !!props.getWebAppConfigValue(BooleanSetting.display_trail);
  const animate =
    !props.getWebAppConfigValue(BooleanSetting.disable_animations);
  const cameraView =
    !!props.getWebAppConfigValue(BooleanSetting.show_camera_view_area);
  const topDownAtStart =
    !!props.getWebAppConfigValue(BooleanSetting.top_down_view);
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
    nextConfig.animate = animate;
    nextConfig.cameraView = cameraView;
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
    nextConfig.urlCameraPos = !!configValues.urlCameraPos;
    nextConfig.scene = SCENES[configValues.scene];
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
    displayTrail,
    firmwareHardware,
    lastCaptureTime,
    light,
    mirrorX,
    mirrorY,
    options.power,
    options.stepSize,
    options.useNearest,
    props.negativeZ,
    rotary,
    soilHeight,
    stableGridSize.x,
    stableGridSize.y,
    sunPositionConfig.azimuth,
    sunPositionConfig.inclination,
    perspective,
    vacuum,
    viewpointHeading,
    waterFlow,
    zGantryOffset,
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
    stableGridSize,
    topDownAtStart,
  ]);

  return <ThreeDGarden
    config={config}
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
  const [panelCameraStore] = React.useState(
    () => createPanelCameraStore(props.designer.panelOpen),
  );
  React.useLayoutEffect(() => {
    panelCameraStore.setOpen(props.designer.panelOpen);
  }, [panelCameraStore, props.designer.panelOpen]);
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
