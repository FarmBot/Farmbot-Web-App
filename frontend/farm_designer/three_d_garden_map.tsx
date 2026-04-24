import React from "react";
import { ThreeDGarden } from "../three_d_garden";
import { Config, INITIAL, INITIAL_POSITION } from "../three_d_garden/config";
import {
  BotSize, MapTransformProps, AxisNumberProperty, TaggedPlant,
} from "./map/interfaces";
import { clone } from "lodash";
import { BotPosition, SourceFbosConfig } from "../devices/interfaces";
import {
  TaggedCurve, TaggedFarmwareEnv, TaggedGenericPointer,
  TaggedImage, TaggedLog, TaggedPoint,
  TaggedPointGroup, TaggedSensor, TaggedSensorReading, TaggedWeedPointer,
} from "farmbot";
import { CameraCalibrationData, DesignerState } from "./interfaces";
import { GetWebAppConfigValue } from "../config_storage/actions";
import { BooleanSetting, NumericSetting } from "../session_keys";
import { SlotWithTool } from "../resources/interfaces";
import { calcSunCoordinate, ThreeDGardenPlant } from "../three_d_garden/garden";
import { findCrop, findIcon } from "../crops/find";
import { PeripheralValues } from "./map/layers/farmbot/bot_trail";
import { isPeripheralActiveFunc } from "./map/layers/farmbot/bot_peripherals";
import { DeviceAccountSettings } from "farmbot/dist/resources/api_resources";
import { SCENES } from "../settings/three_d_settings";
import { get3DTime, latLng } from "../three_d_garden/time_travel";
import { parseCalibrationData } from "./map/layers/images/map_image";
import { fetchInterpolationOptions } from "./map/layers/points/interpolation_map";
import { unpackUUID } from "../util";
import { isTopDown } from "../three_d_garden/helpers";
import { perfMark, usePerfRenderCount } from "../performance/perf";

export interface ThreeDGardenMapProps {
  botSize: BotSize;
  mapTransformProps: MapTransformProps;
  gridOffset: AxisNumberProperty;
  get3DConfigValue(key: string): number;
  sourceFbosConfig: SourceFbosConfig;
  negativeZ: boolean;
  designer: DesignerState;
  plants: TaggedPlant[];
  dispatch: Function;
  getWebAppConfigValue: GetWebAppConfigValue;
  curves: TaggedCurve[];
  mapPoints: TaggedGenericPointer[];
  weeds: TaggedWeedPointer[];
  botPosition: BotPosition;
  toolSlots?: SlotWithTool[];
  mountedToolName: string | undefined;
  peripheralValues: PeripheralValues;
  device: DeviceAccountSettings;
  allPoints: TaggedPoint[];
  groups: TaggedPointGroup[];
  images: TaggedImage[];
  sensorReadings: TaggedSensorReading[];
  sensors: TaggedSensor[];
  cameraCalibrationData: CameraCalibrationData;
  farmwareEnvs: TaggedFarmwareEnv[];
  logs: TaggedLog[];
}

export const ThreeDGardenMap = (props: ThreeDGardenMapProps) => {
  usePerfRenderCount("ThreeDGardenMap");
  React.useEffect(() => {
    perfMark("three_d_map_mounted");
  }, []);
  const { gridSize } = props.mapTransformProps;
  const getValue = props.get3DConfigValue;
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
    laser: getValue("laser"),
    stats: getValue("stats"),
    threeAxes: getValue("threeAxes"),
    solar: getValue("solar"),
    lowDetail: getValue("lowDetail"),
    eventDebug: getValue("eventDebug"),
    cableDebug: getValue("cableDebug"),
    lightsDebug: getValue("lightsDebug"),
    moistureDebug: getValue("moistureDebug"),
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
    scene: getValue("scene"),
    people: getValue("people"),
    desk: getValue("desk"),
    sunAzimuth: getValue("sunAzimuth"),
    sunInclination: getValue("sunInclination"),
  };
  const mirrorX = !!configValues.mirrorX;
  const mirrorY = !!configValues.mirrorY;
  const firmwareHardware = props.sourceFbosConfig("firmware_hardware").value;
  const zGantryOffset =
    props.sourceFbosConfig("gantry_height").value as number;
  const soilHeight =
    Math.abs(props.sourceFbosConfig("soil_height").value as number);
  const displayTrail =
    !!props.getWebAppConfigValue(BooleanSetting.display_trail);
  const animate =
    !props.getWebAppConfigValue(BooleanSetting.disable_animations);
  const cameraView =
    !!props.getWebAppConfigValue(BooleanSetting.show_camera_view_area);
  const topDown = isTopDown(props.designer, props.getWebAppConfigValue);
  const viewpointHeading = parseInt(
    "" + props.getWebAppConfigValue(NumericSetting.viewpoint_heading));
  const { latitude, longitude, valid } = latLng(props.device);
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

  const lastCaptureTime = React.useMemo(() => {
    const localIds = props.logs
      .filter(log => !log.body.id // new logs
        && Object.values(["Taking photo"]).includes(log.body.message))
      .map(log => unpackUUID(log.uuid).localId);
    return Math.max(0, ...localIds);
  }, [props.logs]);
  const sunPositionConfig = valid
    ? calcSunCoordinate(
      get3DTime(props.designer.threeDTime).toDate(),
      configValues.heading,
      latitude,
      longitude)
    : {
      azimuth: configValues.sunAzimuth,
      inclination: configValues.sunInclination,
    };
  const stableGridSize = React.useMemo(
    () => ({ x: gridSize.x, y: gridSize.y }),
    [gridSize.x, gridSize.y]);

  const config = React.useMemo(() => {
    const nextConfig = clone(INITIAL);
    nextConfig.botSizeX = stableGridSize.x;
    nextConfig.botSizeY = stableGridSize.y;
    nextConfig.bedWidthOuter = stableGridSize.y + 160;
    nextConfig.bedLengthOuter = stableGridSize.x + 280;
    nextConfig.zoomBeacons = false;
    nextConfig.trail = displayTrail;
    nextConfig.animate = animate;
    nextConfig.cameraView = cameraView;
    nextConfig.kitVersion =
      firmwareHardware == "farmduino_k18" ? "v1.8" : "v1.7";
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
    nextConfig.legsFlush = !!configValues.legsFlush;
    nextConfig.extraLegsX = configValues.extraLegsX;
    nextConfig.extraLegsY = configValues.extraLegsY;
    nextConfig.bedBrightness = configValues.bedBrightness;
    nextConfig.soilBrightness = configValues.soilBrightness;
    nextConfig.clouds = !!configValues.clouds;
    nextConfig.laser = !!configValues.laser;
    nextConfig.stats = !!configValues.stats;
    nextConfig.threeAxes = !!configValues.threeAxes;
    nextConfig.solar = !!configValues.solar;
    nextConfig.lowDetail = !!configValues.lowDetail;
    nextConfig.eventDebug = !!configValues.eventDebug;
    nextConfig.cableDebug = !!configValues.cableDebug;
    nextConfig.lightsDebug = !!configValues.lightsDebug;
    nextConfig.moistureDebug = !!configValues.moistureDebug;
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
    nextConfig.scene = SCENES[configValues.scene];
    nextConfig.people = !!configValues.people;
    nextConfig.north = true;
    nextConfig.desk = !!configValues.desk;
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
    nextConfig.topDown = topDown;
    nextConfig.zoom = true;
    nextConfig.pan = true;
    nextConfig.rotate = !topDown;
    nextConfig.perspective = !topDown;
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
    configValues.ccSupportSize,
    configValues.clouds,
    configValues.columnLength,
    configValues.desk,
    configValues.eventDebug,
    configValues.extraLegsX,
    configValues.extraLegsY,
    configValues.grid,
    configValues.heading,
    configValues.laser,
    configValues.legSize,
    configValues.legsFlush,
    configValues.lightsDebug,
    configValues.lowDetail,
    configValues.moistureDebug,
    configValues.people,
    configValues.scene,
    configValues.soilBrightness,
    configValues.solar,
    configValues.stats,
    configValues.sun,
    configValues.surfaceDebug,
    configValues.threeAxes,
    configValues.tracks,
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
    topDown,
    vacuum,
    viewpointHeading,
    waterFlow,
    zGantryOffset,
  ]);

  const position = React.useMemo(() => {
    const nextPosition = clone(INITIAL_POSITION);
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
  }), [
    props.curves,
    props.designer,
    props.dispatch,
    props.getWebAppConfigValue,
    stableGridSize,
  ]);

  return <ThreeDGarden
    config={config}
    configPosition={position}
    threeDPlants={threeDPlants}
    mapPoints={props.mapPoints}
    weeds={props.weeds}
    toolSlots={props.toolSlots}
    mountedToolName={props.mountedToolName}
    allPoints={props.allPoints}
    groups={props.groups}
    images={props.images}
    sensorReadings={props.sensorReadings}
    sensors={props.sensors}
    addPlantProps={addPlantProps} />;
};

const convertPlantResources = (plants: TaggedPlant[]): ThreeDGardenPlant[] =>
  plants.map(plant => ({
    id: plant.body.id,
    label: plant.body.name,
    icon: findIcon(plant.body.openfarm_slug),
    size: plant.body.radius * 2,
    spread: findCrop(plant.body.openfarm_slug).spread,
    x: plant.body.x,
    y: plant.body.y,
    key: "",
    seed: 0,
  }));

export const convertPlants =
  (_config: Config, plants: TaggedPlant[]): ThreeDGardenPlant[] =>
    convertPlantResources(plants);
