import React from "react";
import { ThreeDGarden } from "../three_d_garden";
import { Config, INITIAL } from "../three_d_garden/config";
import {
  BotSize, MapTransformProps, AxisNumberProperty, TaggedPlant,
} from "./map/interfaces";
import { BotPosition, SourceFbosConfig } from "../devices/interfaces";
import {
  TaggedCurve, TaggedFarmwareEnv, TaggedGenericPointer, TaggedImage,
  TaggedPoint, TaggedPointGroup, TaggedSensor, TaggedSensorReading,
  TaggedWeedPointer,
} from "farmbot";
import { CameraCalibrationData, DesignerState } from "./interfaces";
import { GetWebAppConfigValue } from "../config_storage/actions";
import { BooleanSetting } from "../session_keys";
import { SlotWithTool } from "../resources/interfaces";
import { calcSunCoordinate, ThreeDGardenPlant } from "../three_d_garden/garden";
import { findCrop, findIcon } from "../crops/find";
import { PeripheralValues } from "./map/layers/farmbot/bot_trail";
import { isPeripheralActiveFunc } from "./map/layers/farmbot/bot_peripherals";
import { DeviceAccountSettings } from "farmbot/dist/resources/api_resources";
import { SCENES } from "../settings/three_d_settings";
import { get3DTime } from "../three_d_garden/time_travel";
import { parseCalibrationData } from "./map/layers/images/map_image";
import { fetchInterpolationOptions } from "./map/layers/points/interpolation_map";
import {
  sameArrayByRef,
  useStableArray,
} from "../three_d_garden/use_stable_array";

export interface ThreeDGardenMapProps {
  botSize: BotSize;
  mapTransformProps: MapTransformProps;
  gridOffset: AxisNumberProperty;
  get3DConfigValue(key: string): number;
  sourceFbosConfig: SourceFbosConfig;
  negativeZ: boolean;
  designer: DesignerState;
  plants: TaggedPlant[];
  showSpread?: boolean;
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
}

const ThreeDGardenMapBase = (props: ThreeDGardenMapProps) => {
  const stablePlants = useStableArray(props.plants) || [];
  const stableMapPoints = useStableArray(props.mapPoints) || [];
  const stableWeeds = useStableArray(props.weeds) || [];
  const stableToolSlots = useStableArray(props.toolSlots);
  const stableAllPoints = useStableArray(props.allPoints) || [];
  const stableGroups = useStableArray(props.groups) || [];
  const stableImages = useStableArray(props.images) || [];
  const stableSensorReadings = useStableArray(props.sensorReadings) || [];
  const stableSensors = useStableArray(props.sensors) || [];
  const stableCurves = useStableArray(props.curves) || [];
  const stableFarmwareEnvs = useStableArray(props.farmwareEnvs) || [];
  const { gridSize } = props.mapTransformProps;
  const getValue = props.get3DConfigValue;
  const heading = getValue("heading");
  const sunAzimuthDefault = getValue("sunAzimuth");
  const sunInclinationDefault = getValue("sunInclination");
  const sunPosition = React.useMemo(() => {
    const latitude = parseFloat("" + props.device.lat);
    const longitude = parseFloat("" + props.device.lng);
    const valid = isFinite(latitude) && isFinite(longitude);
    if (valid) {
      const date = get3DTime(props.designer.threeDTime).toDate();
      const { azimuth, inclination } = calcSunCoordinate(
        date, heading, latitude, longitude);
      return { azimuth, inclination };
    }
    return {
      azimuth: sunAzimuthDefault,
      inclination: sunInclinationDefault,
    };
  }, [
    props.device.lat,
    props.device.lng,
    props.designer.threeDTime,
    heading,
    sunAzimuthDefault,
    sunInclinationDefault,
  ]);
  const camCalData = React.useMemo(
    () => parseCalibrationData(props.cameraCalibrationData),
    [props.cameraCalibrationData],
  );
  const interpolationOptions = React.useMemo(
    () => fetchInterpolationOptions(stableFarmwareEnvs),
    [stableFarmwareEnvs],
  );
  const isPeripheralActive = React.useMemo(
    () => isPeripheralActiveFunc(props.peripheralValues),
    [props.peripheralValues],
  );
  const rotary = React.useMemo(() => {
    const fwd = isPeripheralActive("rotary", "reverse");
    const rev = isPeripheralActive("reverse");
    if (rev && !fwd) { return -1; }
    if (fwd && !rev) { return 1; }
    return 0;
  }, [isPeripheralActive]);
  const peripheralStates = React.useMemo(() => ({
    waterFlow: isPeripheralActive("water"),
    light: isPeripheralActive("light"),
    vacuum: isPeripheralActive("vacuum"),
    rotary,
  }), [
    isPeripheralActive,
    rotary,
  ]);
  const sizeConfig = React.useMemo(() => ({
    botSizeX: gridSize.x,
    botSizeY: gridSize.y,
    bedWidthOuter: gridSize.y + 160,
    bedLengthOuter: gridSize.x + 280,
  }), [gridSize.x, gridSize.y]);
  const settingsConfig = React.useMemo(() => ({
    bedWallThickness: getValue("bedWallThickness"),
    bedHeight: getValue("bedHeight"),
    ccSupportSize: getValue("ccSupportSize"),
    beamLength: getValue("beamLength"),
    columnLength: getValue("columnLength"),
    zAxisLength: getValue("zAxisLength"),
    bedXOffset: getValue("bedXOffset"),
    bedYOffset: getValue("bedYOffset"),
    bedZOffset: getValue("bedZOffset"),
    legSize: getValue("legSize"),
    legsFlush: !!getValue("legsFlush"),
    extraLegsX: getValue("extraLegsX"),
    extraLegsY: getValue("extraLegsY"),
    bedBrightness: getValue("bedBrightness"),
    soilBrightness: getValue("soilBrightness"),
    clouds: !!getValue("clouds"),
    laser: !!getValue("laser"),
    stats: !!getValue("stats"),
    threeAxes: !!getValue("threeAxes"),
    solar: !!getValue("solar"),
    lowDetail: !!getValue("lowDetail"),
    eventDebug: !!getValue("eventDebug"),
    cableDebug: !!getValue("cableDebug"),
    lightsDebug: !!getValue("lightsDebug"),
    moistureDebug: !!getValue("moistureDebug"),
    surfaceDebug: getValue("surfaceDebug"),
    sun: getValue("sun"),
    ambient: getValue("ambient"),
    bounds: !!getValue("bounds"),
    grid: !!getValue("grid"),
    tracks: !!getValue("tracks"),
    cableCarriers: !!getValue("cableCarriers"),
    axes: !!getValue("axes"),
    xyDimensions: !!getValue("xyDimensions"),
    zDimension: !!getValue("zDimension"),
    scene: SCENES[getValue("scene")],
    people: !!getValue("people"),
    desk: !!getValue("desk"),
  }), [getValue]);
  const botPositionConfig = React.useMemo(() => ({
    x: props.botPosition.x || 0,
    y: props.botPosition.y || 0,
    z: props.botPosition.z || 0,
  }), [props.botPosition.x, props.botPosition.y, props.botPosition.z]);
  const trail = !!props.getWebAppConfigValue(BooleanSetting.display_trail);
  const animate = !props.getWebAppConfigValue(
    BooleanSetting.disable_animations);
  const cameraView = !!props.getWebAppConfigValue(
    BooleanSetting.show_camera_view_area,
  );
  const kitVersion =
    props.sourceFbosConfig("firmware_hardware").value == "farmduino_k18"
      ? "v1.8"
      : "v1.7";
  const { zGantryOffset, soilHeight } = React.useMemo(() => ({
    zGantryOffset: props.sourceFbosConfig("gantry_height").value as number,
    soilHeight: Math.abs(
      props.sourceFbosConfig("soil_height").value as number,
    ),
  }), [props.sourceFbosConfig]);
  const config = React.useMemo(() => ({
    ...INITIAL,
    ...sizeConfig,
    ...settingsConfig,
    zoomBeacons: false,
    trail,
    animate,
    cameraView,
    kitVersion,
    negativeZ: props.negativeZ,
    exaggeratedZ: props.designer.threeDExaggeratedZ,
    x: botPositionConfig.x,
    y: botPositionConfig.y,
    z: botPositionConfig.z,
    distanceIndicator: props.designer.distanceIndicator,
    zGantryOffset,
    soilHeight,
    heading,
    north: true,
    plants: "",
    sunAzimuth: sunPosition.azimuth,
    sunInclination: sunPosition.inclination,
    waterFlow: peripheralStates.waterFlow,
    light: peripheralStates.light,
    vacuum: peripheralStates.vacuum,
    rotary: peripheralStates.rotary,
    imgScale: camCalData.imageScale,
    imgRotation: camCalData.imageRotation,
    imgOffsetX: camCalData.imageOffsetX,
    imgOffsetY: camCalData.imageOffsetY,
    imgOrigin: camCalData.imageOrigin,
    imgCalZ: camCalData.calibrationZ,
    imgCenterX: camCalData.centerX,
    imgCenterY: camCalData.centerY,
    interpolationStepSize: interpolationOptions.stepSize,
    interpolationUseNearest: interpolationOptions.useNearest,
    interpolationPower: interpolationOptions.power,
    zoom: true,
    pan: true,
    rotate: !props.designer.threeDTopDownView,
    perspective: !props.designer.threeDTopDownView,
  }), [
    animate,
    botPositionConfig.x,
    botPositionConfig.y,
    botPositionConfig.z,
    cameraView,
    camCalData.calibrationZ,
    camCalData.centerX,
    camCalData.centerY,
    camCalData.imageOffsetX,
    camCalData.imageOffsetY,
    camCalData.imageOrigin,
    camCalData.imageRotation,
    camCalData.imageScale,
    heading,
    interpolationOptions.power,
    interpolationOptions.stepSize,
    interpolationOptions.useNearest,
    kitVersion,
    peripheralStates.light,
    peripheralStates.rotary,
    peripheralStates.vacuum,
    peripheralStates.waterFlow,
    props.designer.distanceIndicator,
    props.designer.threeDExaggeratedZ,
    props.designer.threeDTopDownView,
    props.negativeZ,
    settingsConfig,
    sizeConfig,
    soilHeight,
    sunPosition.azimuth,
    sunPosition.inclination,
    trail,
    zGantryOffset,
  ]);

  const threeDPlants = React.useMemo(
    () => convertPlants(config, stablePlants),
    [config.bedXOffset, config.bedYOffset, stablePlants],
  );
  const addPlantProps = React.useMemo(() => ({
    gridSize: props.mapTransformProps.gridSize,
    dispatch: props.dispatch,
    getConfigValue: props.getWebAppConfigValue,
    curves: stableCurves,
    designer: props.designer,
  }), [
    props.designer,
    props.dispatch,
    props.getWebAppConfigValue,
    props.mapTransformProps.gridSize,
    stableCurves,
  ]);

  return <ThreeDGarden
    config={config}
    threeDPlants={threeDPlants}
    showSpread={props.showSpread}
    mapPoints={stableMapPoints}
    weeds={stableWeeds}
    toolSlots={stableToolSlots}
    mountedToolName={props.mountedToolName}
    allPoints={stableAllPoints}
    groups={stableGroups}
    images={stableImages}
    sensorReadings={stableSensorReadings}
    sensors={stableSensors}
    addPlantProps={addPlantProps} />;
};

const propsAreEqual = (
  prev: ThreeDGardenMapProps,
  next: ThreeDGardenMapProps,
) => {
  if (prev === next) { return true; }
  if (prev.botSize !== next.botSize) { return false; }
  if (prev.mapTransformProps !== next.mapTransformProps) { return false; }
  if (prev.gridOffset !== next.gridOffset) { return false; }
  if (prev.get3DConfigValue !== next.get3DConfigValue) { return false; }
  if (prev.sourceFbosConfig !== next.sourceFbosConfig) { return false; }
  if (prev.negativeZ !== next.negativeZ) { return false; }
  if (prev.designer !== next.designer) { return false; }
  if (prev.dispatch !== next.dispatch) { return false; }
  if (prev.getWebAppConfigValue !== next.getWebAppConfigValue) { return false; }
  if (prev.botPosition !== next.botPosition) { return false; }
  if (prev.peripheralValues !== next.peripheralValues) { return false; }
  if (prev.device !== next.device) { return false; }
  if (prev.mountedToolName !== next.mountedToolName) { return false; }
  if (prev.cameraCalibrationData !== next.cameraCalibrationData) { return false; }
  if (!sameArrayByRef(prev.plants, next.plants)) { return false; }
  if (!sameArrayByRef(prev.curves, next.curves)) { return false; }
  if (!sameArrayByRef(prev.mapPoints, next.mapPoints)) { return false; }
  if (!sameArrayByRef(prev.weeds, next.weeds)) { return false; }
  if (!sameArrayByRef(prev.toolSlots, next.toolSlots)) { return false; }
  if (!sameArrayByRef(prev.allPoints, next.allPoints)) { return false; }
  if (!sameArrayByRef(prev.groups, next.groups)) { return false; }
  if (!sameArrayByRef(prev.images, next.images)) { return false; }
  if (!sameArrayByRef(prev.sensorReadings, next.sensorReadings)) { return false; }
  if (!sameArrayByRef(prev.sensors, next.sensors)) { return false; }
  if (!sameArrayByRef(prev.farmwareEnvs, next.farmwareEnvs)) { return false; }
  return true;
};

export const ThreeDGardenMap =
  React.memo(ThreeDGardenMapBase, propsAreEqual);

export const convertPlants = (
  config: Config,
  plants: TaggedPlant[],
): ThreeDGardenPlant[] => {
  const bedXOffset = config.bedXOffset;
  const bedYOffset = config.bedYOffset;
  const iconCache = new Map<string, string>();
  const spreadCache = new Map<string, number>();
  const results = new Array<ThreeDGardenPlant>(plants.length);
  for (let i = 0; i < plants.length; i++) {
    const { body } = plants[i];
    const slug = body.openfarm_slug;
    let icon = iconCache.get(slug);
    if (icon === undefined) {
      icon = findIcon(slug);
      iconCache.set(slug, icon);
    }
    let spread = spreadCache.get(slug);
    if (spread === undefined) {
      spread = findCrop(slug).spread;
      spreadCache.set(slug, spread);
    }
    results[i] = {
      id: body.id,
      label: body.name,
      icon,
      size: body.radius * 2,
      spread,
      x: body.x + bedXOffset,
      y: body.y + bedYOffset,
      key: "",
      seed: 0,
    };
  }
  return results;
};
